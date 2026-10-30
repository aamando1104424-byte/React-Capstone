import { useEffect, useRef } from "react";
import { useGame } from "../game/hooks.js";
import { buyItem, buyPotion, leaveShop, potionPrice, weaponIn } from "../game/engine.js";
import { relics, shopkeeper } from "../game/relics.js";
import { weapons } from "../game/weapons.js";
import { maxPotions } from "../game/config.js";

// The pardoner's cart, between waves: weapons first, then relics. Escape does
// not close it, so a stray key cannot skip the shop; "Move on" is the only
// way out.
export default function ShopDialog() {
    const game = useGame();
    const shop = game.shop;
    const user = game.user;
    const dialog = useRef(null);
    const open = shop !== null;

    useEffect(function() {
        const el = dialog.current;
        if (open && el.open === false) {
            el.showModal();
        } else if (open === false && el.open) {
            el.close();
        }
    }, [open]);

    const potionsFull = user.potions >= maxPotions;
    const price = potionPrice();

    return (
        <dialog
            id="shopDialog"
            ref={dialog}
            aria-labelledby="shopTitle"
            onCancel={function(event) {
                event.preventDefault();
            }}
        >
            {open && (
                <>
                    <p className="choice-kicker">Between waves</p>
                    <h2 id="shopTitle">{shopkeeper.title}</h2>
                    <p className="choice-sub">{shopkeeper.name}: "{shop.line}"</p>
                    <p className="shop-gold">Your gold: <b>{user.gold}</b></p>

                    {shop.stock.length === 0 && (
                        <p className="choice-sub">The cart is empty. You already own everything he has.</p>
                    )}
                    <div className="cards shop-cards">
                        {shop.stock.map(function(offer, slot) {
                            const short = user.gold < offer.price;
                            const isWeapon = offer.type === "weapon";
                            const item = isWeapon ? weapons[offer.id] : relics[offer.id];
                            let kind = item.rarity + " relic";
                            let text = item.text;
                            if (isWeapon) {
                                const current = weaponIn(item.element);
                                kind = item.element + " weapon";
                                text = "+" + item.attack + " " + item.element + " attack, "
                                    + (current === null ? "your first " + item.element + " weapon." : "replacing your " + current.name + " (+" + current.attack + ").");
                                if (item.burn) {
                                    text = text + " Sets it burning " + item.burn + " times in 10.";
                                }
                                if (item.bleed) {
                                    text = text + " Makes it bleed " + item.bleed + " times in 10.";
                                }
                            }
                            return (
                                <button
                                    key={offer.type + offer.id}
                                    className={"choice-card " + item.element + (isWeapon ? " weapon-card" : "") + (offer.sold ? " sold" : "")}
                                    style={{ animationDelay: slot * 0.08 + "s" }}
                                    disabled={offer.sold || short}
                                    onClick={function() {
                                        buyItem(slot);
                                    }}
                                >
                                    <span className="card-kind">{kind}</span>
                                    <span className="card-name">{item.name}</span>
                                    {offer.hint && <span className="card-hint">{offer.hint} is weak to this</span>}
                                    <span className="card-text">{text}</span>
                                    <span className="card-flavor">{item.flavor}</span>
                                    <span className="card-price">
                                        {offer.sold ? "Bought" : offer.price + " gold" + (short ? " (not enough)" : "")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="shop-actions">
                        <button
                            className="act"
                            disabled={user.gold < price || potionsFull}
                            onClick={buyPotion}
                        >
                            {potionsFull ? "Potions full (" + user.potions + ")" : "Buy potion: " + price + " gold (" + user.potions + "/" + maxPotions + ")"}
                        </button>
                        <button className="act shop-leave" onClick={leaveShop}>Move on</button>
                    </div>
                </>
            )}
        </dialog>
    );
}
