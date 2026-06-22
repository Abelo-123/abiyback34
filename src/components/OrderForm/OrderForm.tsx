import React, { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Section, Input, Textarea, Button, Cell } from '@telegram-apps/telegram-ui';
import { useApp } from '../../context/AppContext';
import { formatETB, getLinkPlaceholder, QUANTITY_STEP } from '../../constants';
import * as api from '../../api';
import {
    hapticImpact,
    hapticNotification,
    configureMainButton,
    showMainButton,
    hideMainButton,
    onMainButtonClick,
    enableClosingConfirmation,
    disableClosingConfirmation,
} from '../../helpers/telegram';

// URL validation helper - supports http, https, t.me, telegram.me, instagram.com, etc.
function isValidUrl(str: string): boolean {
    if (!str.trim()) return false;
    // Allow any URL-like string that contains a domain or t.me/telegram.me
    const urlPattern = /^(https?:\/\/|t\.me\/|telegram\.me\/|@)/i;
    return urlPattern.test(str.trim());
}

export type OrderFormHandle = { submit: () => Promise<void> };
export const OrderForm = forwardRef<OrderFormHandle, {}>(function OrderForm(_props, ref) {
    const {
        selectedService, selectedPlatform, selectedCategory,
        rateMultiplier, discountPercent,
        user, userCanOrder, isTelegramApp, showToast,
        setBalance, setOrders, orders,
    } = useApp();

    // Form State
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [comments, setComments] = useState('');
    const [answerNumber, setAnswerNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Track which fields user has interacted with (to avoid showing initial errors)
    const [touched, setTouched] = useState<{
        link?: boolean;
        quantity?: boolean;
        comments?: boolean;
        answerNumber?: boolean;
    }>({});
    
    // Field-level error state
    const [errors, setErrors] = useState<{
        link?: string;
        quantity?: string;
        comments?: string;
        answerNumber?: string;
        general?: string;
    }>({});

    const service = selectedService!;

    // Memoized calculations
    const { charge, hasDiscount } = useMemo(() => {
        const qty = parseInt(quantity) || 0;
        const original = (qty / 1000) * service.rate * rateMultiplier;
        const discounted = discountPercent > 0 ? original * (1 - discountPercent / 100) : original;
        return {
            charge: discounted,
            hasDiscount: discountPercent > 0,
        };
    }, [quantity, service.rate, rateMultiplier, discountPercent]);

    const placeholder = getLinkPlaceholder(selectedCategory || '', selectedPlatform || 'other');
    const showComments = ['Custom Comments', 'Custom Comments Package', 'Mentions with Hashtags'].includes(service.type);
    const showQuantity = service.type !== 'Package';
    const showPoll = service.type === 'Poll';

    // Validation with error messages - only show errors for touched fields
    const validation = useMemo(() => {
        const errs: typeof errors = {};
        
        // Link validation (only show if user has interacted with field)
        if (touched.link) {
            if (!link.trim()) {
                errs.link = 'Link is required';
            } else if (!isValidUrl(link.trim())) {
                errs.link = 'Please enter a valid URL or username';
            }
        }
        
        // Quantity validation (only show if user has interacted with field)
        if (touched.quantity && showQuantity && !showComments) {
            const qty = parseInt(quantity);
            if (!quantity || isNaN(qty)) {
                errs.quantity = 'Quantity is required';
            } else if (qty < service.min) {
                errs.quantity = `Minimum quantity is ${service.min}`;
            } else if (qty > service.max) {
                errs.quantity = `Maximum quantity is ${service.max.toLocaleString()}`;
            } else if (qty % QUANTITY_STEP !== 0) {
                errs.quantity = `Quantity must be in multiples of ${QUANTITY_STEP}`;
            }
        }
        
        // Comments validation (only show if user has interacted with field)
        if (touched.comments && showComments) {
            const lines = comments.split('\n').filter((l: string) => l.trim());
            if (lines.length === 0) {
                errs.comments = 'Please enter at least one comment';
            } else if (lines.length < service.min) {
                errs.comments = `Minimum ${service.min} comments required`;
            } else if (lines.length > service.max) {
                errs.comments = `Maximum ${service.max} comments allowed`;
            }
        }
        
        // Answer number validation for polls (only show if user has interacted with field)
        if (touched.answerNumber && showPoll) {
            const ans = parseInt(answerNumber);
            if (!answerNumber || isNaN(ans)) {
                errs.answerNumber = 'Answer number is required';
            }
        }
        
        // Balance check - always show
        if (user && charge > user.balance) {
            errs.general = `Insufficient balance. You have ${formatETB(user.balance)} but need ${formatETB(charge)}`;
        }
        
        // Check if ordering is allowed - always show
        if (!userCanOrder) {
            errs.general = 'Ordering is currently disabled. Please try again later.';
        }
        
        return {
            isValid: Object.keys(errs).length === 0,
            errors: errs,
        };
    }, [link, quantity, comments, answerNumber, service, charge, user, userCanOrder, showComments, showQuantity, showPoll, touched]);

    // For backward compatibility
    const isValid = validation.isValid;

    // Submit Handler
    const handleSubmit = async () => {
        // First, mark all fields as touched so validation errors show
        setTouched({ link: true, quantity: true, comments: true, answerNumber: true });
        
        // Then validate (after touching, errors will show)
        if (!validation.isValid) {
            // Provide haptic feedback for error
            if (isTelegramApp) {
                hapticNotification('error');
            }
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            const qty = service.type === 'Package' ? service.min : parseInt(quantity);
            
            const response = await api.placeOrder({
                service: service.id,
                link,
                quantity: qty,
                tg_id: user?.id,
                comments: comments || undefined,
                answer_number: answerNumber ? parseInt(answerNumber) : undefined,
            });

            if (response.success) {
                const newOrder = {
                    id: response.order_id,
                    api_order_id: response.order_id,
                    service_id: service.id,
                    service_name: service.name,
                    link,
                    quantity: qty,
                    charge,
                    status: 'pending' as const,
                    remains: qty,
                    start_count: 0,
                    created_at: new Date().toISOString(),
                };

                setOrders([newOrder, ...orders]);
                if (user) setBalance(response.new_balance);
                showToast('success', `Order #${response.order_id} placed!`);
                hapticImpact('heavy');
                hapticNotification('success');

                setLink('');
                setQuantity('');
                setComments('');
                setAnswerNumber('');
            } else {
                // Handle API error response
                const errorMsg = response.error || 'Failed to place order';
                setErrors({ general: errorMsg });
                showToast('error', errorMsg);
                hapticNotification('error');
            }
        } catch (err: any) {
            // Handle network/connection errors
            const errorMsg = err.message || 'Network error. Please check your connection and try again.';
            setErrors({ general: errorMsg });
            showToast('error', errorMsg);
            hapticNotification('error');
        } finally {
            setSubmitting(false);
        }
    };

    // Imperative submit binding for non-Telegram path
    useImperativeHandle(ref, () => ({ submit: handleSubmit }), [handleSubmit]);
    // MainButton Effect — all via SDK helpers
    const handleSubmitRef = useRef(handleSubmit);
    useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

    useEffect(() => {
        if (!isTelegramApp) return;

        const handleMainBtnClick = () => handleSubmitRef.current();

        if (submitting) {
            configureMainButton({
                text: 'PLACING ORDER...',
                isEnabled: true,
                isLoaderVisible: true,
            });
        } else if (isValid) {
            configureMainButton({
                text: `PAY ${formatETB(charge)}`,
                color: '#2ecc71',
                textColor: '#ffffff',
                isEnabled: true,
                isLoaderVisible: false,
            });
        } else {
            let text = 'FILL DETAILS';
            if (!link.trim()) text = 'ENTER LINK';
            else if (user && charge > user.balance) text = 'INSUFFICIENT FUNDS';
            else text = 'INVALID QUANTITY';

            configureMainButton({
                text,
                color: '#95a5a6',
                textColor: '#ffffff',
                isEnabled: false,
                isLoaderVisible: false,
            });
        }

        showMainButton();
        const off = onMainButtonClick(handleMainBtnClick);

        return () => {
            off();
            hideMainButton();
        };
    }, [isTelegramApp, isValid, submitting, charge, link, user]);

    // Closing Confirmation via SDK — protect unsaved form data
    useEffect(() => {
        if ((link || quantity) && !submitting) {
            enableClosingConfirmation();
        } else {
            disableClosingConfirmation();
        }
        return () => disableClosingConfirmation();
    }, [link, quantity, submitting]);

    return (
        <>
            <Section
                header={`Selected Service: ${service.name} `}
                footer={user && charge > user.balance ? `Insufficient Balance(Have: ${formatETB(user.balance)})` : `Total Charge: ${formatETB(charge)} `}
            >
                <Cell
                    subtitle={`${service.min} - ${service.max.toLocaleString()} • Rate: ${formatETB(service.rate)} `}
                    multiline
                >
                    {service.category}
                </Cell>

                {hasDiscount && (
                    <Cell before="🔥" after={`- ${discountPercent}% `}>
                        Discount applied
                    </Cell>
                )}
            </Section>

            <Section header="Order Details">
                <Input
                    header="Link"
                    placeholder={placeholder}
                    value={link}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLink(e.target.value);
                        setTouched(prev => ({ ...prev, link: true }));
                        setErrors(prev => ({ ...prev, link: undefined }));
                    }}
                    status={validation.errors.link ? 'error' : 'default'}
                />
                {validation.errors.link && (
                    <div className="order-form-error">{validation.errors.link}</div>
                )}

                {showQuantity && !showComments && (
                    <>
                        <Input
                            header="Quantity"
                            placeholder={`Min: ${service.min} - Max: ${service.max.toLocaleString()}`}
                            type="number"
                            value={quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setQuantity(e.target.value);
                                setTouched(prev => ({ ...prev, quantity: true }));
                                setErrors(prev => ({ ...prev, quantity: undefined }));
                            }}
                            status={validation.errors.quantity ? 'error' : 'default'}
                        />
                        {validation.errors.quantity && (
                            <div className="order-form-error">{validation.errors.quantity}</div>
                        )}
                    </>
                )}

                {showComments && (
                    <>
                        <Textarea
                            header="Comments (One per line)"
                            placeholder="Enter list of comments..."
                            value={comments}
                            onChange={(e: any) => {
                                setComments(e.target.value);
                                setTouched(prev => ({ ...prev, comments: true }));
                                setErrors(prev => ({ ...prev, comments: undefined }));
                            }}
                            status={validation.errors.comments ? 'error' : 'default'}
                        />
                        {validation.errors.comments && (
                            <div className="order-form-error">{validation.errors.comments}</div>
                        )}
                        <div className="order-form-hint">
                            {comments.split('\n').filter((l: string) => l.trim()).length} / {service.max} comments
                        </div>
                    </>
                )}

                {showPoll && (
                    <>
                        <Input
                            header="Answer Number"
                            type="number"
                            value={answerNumber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setAnswerNumber(e.target.value);
                                setTouched(prev => ({ ...prev, answerNumber: true }));
                                setErrors(prev => ({ ...prev, answerNumber: undefined }));
                            }}
                            status={validation.errors.answerNumber ? 'error' : 'default'}
                        />
                        {validation.errors.answerNumber && (
                            <div className="order-form-error">{validation.errors.answerNumber}</div>
                        )}
                    </>
                )}
            </Section>

            {/* General Error Message */}
            {validation.errors.general && (
                <div className="order-form-error order-form-error--general">
                    {validation.errors.general}
                </div>
            )}

            {/* Fallback Button for Non-Telegram Environment */}
            {!isTelegramApp && (
                <Section>
                    <Button
                        size="l"
                        stretched
                        disabled={!isValid || submitting}
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        {submitting ? 'Ordering...' : `Pay ${formatETB(charge)} `}
                    </Button>
                </Section>
            )}
        </>
    );
});
