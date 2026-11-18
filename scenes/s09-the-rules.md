# Scene 09 — The rules

**Part 3 · Aloha: the idea** · **Audio:** 28.2 s · **Starts at:** 2:34 · **Composition:** `S09TheRules` · **Audio file:** `build/narration/s09.wav`

## Narration

> Their solution was almost cheeky in its simplicity. Rule one. If you have a packet, send it. Right away. Don't ask permission, and don't check first. Rule two. When the hub receives a packet cleanly, it sends back a short confirmation, called an acknowledgment. Like hearing "copy that" on a walkie-talkie. Rule three. If no acknowledgment comes back, assume your packet collided. Wait a random amount of time, and send it again.

## What the viewer must walk away with
The protocol: **send immediately → get an ACK → no ACK means wait a random time and resend.**

## Real-life layer
- **Rule 1:** someone at the bus stop blurts out a question without checking whether anyone else is talking. A small,
  cheeky "just go" moment.
- **Rule 2:** **Talker A** on the walkie-talkie says "Truck's here, over." The supervisor replies **"Copy that."**
  A green ✓ pops over A's head.
- **Rule 3:** A speaks, but static drowns it (callback to Scene 06). No "copy that" comes. A waits, glances at a
  rolling **die**, then repeats the message. This time "Copy that" ✓.

## Theory layer
The **hub-and-terminals** ring from Scene 08. Three rule cards build up on the left:
1. **Send immediately**
2. **Hub replies with an ACK**: a small green ✓ packet flies back from the hub on a *different* colour arc
3. **No ACK → wait a random time → resend**

One terminal runs the full cycle as a mini-animation: send (blue bar) → collides with another (red) → no ACK arrives
(timer runs out) → die roll → resend (amber retry bar) → ACK ✓ (green).

## Bridge: real life → theory
Split screen. Walkie-talkie on the left, hub ring on the right, running **in sync**: "Copy that" on the left lands at the
same moment as the ✓ ACK packet on the right. For Rule 3, the static on the left matches the red collision on the right.

## Beat sheet

| Narration cue | Visual |
|---|---|
| "Their solution was almost cheeky in its simplicity." | Hub ring from 08. A small wink or sparkle on the title "The Aloha rules". |
| "Rule one. If you have a packet, send it. Right away." | Card 1. A terminal fires a blue packet instantly. |
| "Don't ask permission, and don't check first." | A crossed-out "May I?" bubble. |
| "Rule two. …sends back a short confirmation, called an acknowledgment." | Card 2. The hub sends a green ✓ **ACK** packet back on a separate-colour arc. |
| "Like hearing "copy that" on a walkie-talkie." | Left split: supervisor says "Copy that" → ✓ over Talker A. |
| "Rule three. If no acknowledgment comes back, assume your packet collided." | Card 3. Static on the left, red collision on the right. An ACK timer runs out. |
| "Wait a random amount of time, and send it again." | Die roll → amber retry bar → green ✓ on both sides. |

## On-screen text (exact)
- Title: **The Aloha rules**
- **1 · Send immediately**
- **2 · Hub replies with an ACK** (acknowledgment)
- **3 · No ACK? → wait a random time → resend**

## Handoff
- **Opens on:** the hub-and-terminals ring.
- **Closes on:** the three rule cards complete and a green ✓. Scene 10 zooms into Rule 3's "random".

## Notes / pitfalls
- New packets are blue and retries are amber. Start that colour convention here and keep it everywhere.
