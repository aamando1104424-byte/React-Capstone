// Two layers: the fill moves at once, the lag trails it so you can see how much
// the last hit took off.
export default function Bar({ id, className, value, max }) {
    const percent = Math.max(0, Math.min(100, (value / max) * 100));
    const width = { width: percent + "%" };
    return (
        <div className={"bar " + className} id={id} aria-hidden="true">
            <div className="bar-lag" style={width}></div>
            <div className="bar-fill" style={width}></div>
        </div>
    );
}

// Faith drawn as pips. "cost" is the small inline version on a button.
export function Pips({ count, max, className, id, label }) {
    const pips = [];
    for (let i = 1; i <= max; i++) {
        pips.push(<span key={i} className={"pip" + (i <= count ? " on" : "")}></span>);
    }
    return (
        <span className={className} id={id} aria-label={label}>
            {pips}
        </span>
    );
}

export function FaithCost({ cost }) {
    return <Pips count={cost} max={cost} className="cost" />;
}
