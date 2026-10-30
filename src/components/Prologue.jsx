// The opening. Its button is the first click on the page, which is the only
// moment browsers will let the sound start.
export default function Prologue({ onStart }) {
    return (
        <section className="prologue" id="prologue">
            <h1>The Fall of the Dead</h1>
            <p>You were Sir Aldric of Varrow, a knight of the Order of Saint Anselm. In eleven years you never missed a Mass.</p>
            <p>Then came the plague summer. You buried your wife and your son in the same week, and the priest would not come to the graves for fear of catching it.</p>
            <p>You threw your sword and your mail into the river, and you drank for three years.</p>
            <p>Tonight the bells of Varrow are ringing and nobody is pulling the ropes. The dead are in the streets.</p>
            <p className="last">No one is coming to save this town. There is only you, and you are drunk.</p>
            <button onClick={onStart} autoFocus>Get up</button>
        </section>
    );
}
