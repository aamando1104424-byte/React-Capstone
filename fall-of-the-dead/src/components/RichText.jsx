// Draws a line built by the engine: plain strings, plus the coloured tags,
// numbers and names. style.css gives each kind its own colour per rank.

export function Tag({ kind, children }) {
    return (
        <>
            <span className={"tag " + kind}>{children}</span>{" "}
        </>
    );
}

function Part({ part }) {
    if (typeof part === "string" || typeof part === "number") {
        return part;
    }
    switch (part.t) {
        case "tag":
            return <Tag kind={part.kind}>{part.label}</Tag>;
        case "num":
            return <b className={"num " + part.kind}>{part.value}</b>;
        case "hero":
            return <span className="hero">{part.text}</span>;
        case "foe":
            return <span className="foe">{part.text}</span>;
        case "item":
            return <span className="item">{part.text}</span>;
        case "strong":
            return <strong>{part.text}</strong>;
        default:
            return null;
    }
}

export default function RichText({ parts }) {
    return parts.map(function(part, i) {
        return <Part key={i} part={part} />;
    });
}
