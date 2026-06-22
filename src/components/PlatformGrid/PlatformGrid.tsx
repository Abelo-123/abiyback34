import { PLATFORMS } from '../../constants';
import { hapticSelection } from '../../helpers/telegram';
import type { SocialPlatform } from '../../types';

interface Props {
    selectedPlatform: SocialPlatform | null;
    onSelect: (platform: SocialPlatform) => void;
}

export function PlatformGrid({ selectedPlatform, onSelect }: Props) {
    return (
        <div className="platform-grid">
            {PLATFORMS.map(p => {
                const isActive = selectedPlatform === p.id;
                return (
                    <button
                        key={p.id}
                        className={`platform-card${isActive ? ' platform-card--active' : ''}`}
                        onClick={() => {
                            hapticSelection();
                            onSelect(p.id);
                        }}
                    >
                        <span className="platform-card__icon">{p.icon}</span>
                        <span className="platform-card__label">{p.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
