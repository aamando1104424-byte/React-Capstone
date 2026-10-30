// Leaderboard
// The roll of the fallen, shared by everyone who plays. Runs live in the
// `scores` table on Supabase (see supabase/schema.sql). Anyone can read the
// board and add a run; nobody can edit or delete one.

import { supabase } from "./supabase.js";
import { boardSize } from "./config.js";

const columns = "id, name, rank, score, kills, wave, created_at";

// The best runs first. A tie goes to whoever got there first.
export async function loadScores() {
    const { data, error } = await supabase
        .from("scores")
        .select(columns)
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(boardSize);
    if (error) {
        throw error;
    }
    return data;
}

// Returns the new board, and the id of the saved run so it can be picked out.
// The run is saved either way; it only shows if it made the top ten.
export async function saveScore(entry) {
    const { data, error } = await supabase
        .from("scores")
        .insert({
            name: entry.name,
            rank: entry.rank,
            score: entry.score,
            kills: entry.kills,
            wave: entry.wave
        })
        .select("id")
        .single();
    if (error) {
        throw error;
    }
    const scores = await loadScores();
    return { scores: scores, savedId: data.id };
}

// Calls onChange whenever anyone, anywhere, saves a run. Returns a function
// that stops listening.
export function watchScores(onChange) {
    const channel = supabase
        .channel("scores-feed")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "scores" }, onChange)
        .subscribe();
    return function() {
        supabase.removeChannel(channel);
    };
}
