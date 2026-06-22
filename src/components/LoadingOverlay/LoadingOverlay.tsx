export function LoadingOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-overlay__spinner" />
            <div className="loading-overlay__text">Loading...</div>
        </div>
    );
}
