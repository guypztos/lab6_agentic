# SCRIPT — "Nobody's in Charge: Aloha and the Poisson Process"

**Goal.** By about 1:00 the viewer knows what a Poisson process is and where it shows up in real life
(Part 1 ends at **1:00**). The rest builds the Aloha model from scratch for someone who knows nothing about networks.

**Audience.** Curious beginners: no networking background, high-school math, no calculus required.
**Runtime.** ≈ **8:10** (measured Kokoro `af_heart` narration + 0.8 s padding per scene).
**Through-line.** Every idea first appears as something the viewer has lived through. The anchor is one bus stop and
one character, the Commuter. That picture then morphs into the diagram.

## How this script is organised

- This file is the **read-through**: all narration in order, with a one-line picture per scene.
- Each scene has a **full production brief** in [`scenes/`](scenes/README.md), one file per scene so separate agents can
  build scenes in parallel. **Start with [`scenes/README.md`](scenes/README.md)**: style guide, recurring cast and props,
  continuity, TTS rules.
- **The scene files are canonical.** This file is generated from them. If narration changes, edit the scene file.
- **TTS:** replace `Poisson` → `Pouasson` before generating, and generate in chunks of whole sentences (≤ ~250 chars).
  Details are in `scenes/README.md`.

---


## Part 1 — The Poisson process

### [Scene 01 — Cold open](scenes/s01-cold-open.md) · 0:00 · 11 s

> Random things are happening all around you. A phone buzzes. A bus pulls up. A raindrop hits the window. You can't predict the next one, yet they all follow one pattern.

*Picture:* Bus-stop street: phone buzz, bus, raindrop → each drops a dot onto its own timeline.

### [Scene 02 — The three rules](scenes/s02-three-rules.md) · 0:12 · 18 s

> It's called a Poisson process, and it has three rules. First, events arrive at a steady average rate, called lambda. Say, ten buses an hour. Second, they're independent. Waited five minutes already? The bus is no more likely to come now. Third, they arrive one at a time.

*Picture:* Commuter waits at the stop; buses become dots. λ counter, a flat 'no memory' meter, dots never coincide.

### [Scene 03 — Why it's everywhere](scenes/s03-why-everywhere.md) · 0:31 · 14 s

> Why is it everywhere? It's what you get when lots of people each have a small, independent chance of doing something, like heading to a bus stop. A train leaving exactly on the hour, though, isn't Poisson. It's a schedule.

*Picture:* Neighbourhood: rare walkers from many houses merge into one busy stream at the stop. Train timetable = ✗.

### [Scene 04 — The one formula](scenes/s04-one-formula.md) · 0:46 · 14 s

> Here's the one formula to keep. The chance that nothing happens for a time t is e to the minus lambda t. With ten buses an hour, the chance you wait over six minutes is about thirty-seven percent. Everything builds on this.

*Picture:* Eight 'parallel universe' 6-minute waits, ~3 with no bus → sliding window → e^(−λt) ≈ 37%. Formula pocket.


## Part 2 — Networks from zero

### [Scene 05 — What a network is](scenes/s05-what-is-a-network.md) · 1:00 · 31 s

> Now let's use this to solve a real problem, starting from zero. A network is just a group of devices sending messages to each other. Like a phone at that bus stop, texting a friend that the bus is late. Computers don't send a message in one piece. They chop it into small chunks, called packets, like a long letter mailed as numbered postcards. Each packet is a burst of ones and zeros, sent as a signal. Pulses of electricity in a wire, or radio waves through the air.

*Picture:* Commuter texts 'Bus is late again' → letter cut into numbered postcards → packet bars → bits → wire / radio.

### [Scene 06 — Sharing a channel, and collisions](scenes/s06-collisions.md) · 1:32 · 25 s

> Here's the catch. Many devices often share one channel. Think of a walkie-talkie. Everyone is on the same frequency. If one person talks, everybody hears them clearly. But if two people talk at the same moment, their signals pile on top of each other, and all you hear is noise. In networking, that's called a collision. And in a collision, both packets are lost. Not just one. Both.

*Picture:* Two walkie-talkies on CH 1: one talker is clear, two make static → two packet bars collide, both shatter.

### [Scene 07 — The question](scenes/s07-the-question.md) · 1:58 · 9 s

> So here's the question. How do you share one channel among many devices, when nobody is in charge, and nobody knows when anyone else wants to talk?

*Picture:* Crowded stop, everyone on a phone, '?' bubbles → ring of nodes around one channel, no controller.


## Part 3 — Aloha: the idea

### [Scene 08 — Hawaii, 1971](scenes/s08-hawaii-1971.md) · 2:08 · 25 s

> In nineteen seventy-one, a team at the University of Hawaii, led by Norman Abramson, faced exactly this problem. They wanted to connect computer terminals spread across the islands to one central computer in Honolulu. Phone lines were expensive and unreliable, so they used radio. Every terminal talked to the hub on the same frequency. They called it Aloha-net.

*Picture:* 1970s map of Hawaii: terminals on islands radio one hub in Honolulu → map melts into a hub-and-terminals ring.

### [Scene 09 — The rules](scenes/s09-the-rules.md) · 2:34 · 28 s

> Their solution was almost cheeky in its simplicity. Rule one. If you have a packet, send it. Right away. Don't ask permission, and don't check first. Rule two. When the hub receives a packet cleanly, it sends back a short confirmation, called an acknowledgment. Like hearing "copy that" on a walkie-talkie. Rule three. If no acknowledgment comes back, assume your packet collided. Wait a random amount of time, and send it again.

*Picture:* Walkie-talkie 'Copy that' = ACK, in sync with the hub diagram: send → collide → no ACK → die roll → resend → ✓.

### [Scene 10 — Why the wait must be random](scenes/s10-why-random.md) · 3:03 · 20 s

> Why random? You've probably done this in a hallway. You step left to let someone pass, and they step left too. You both step right. Again. Two terminals that wait exactly the same time after a collision would do that dance forever. But if each one picks a random delay, they'll almost certainly retry at different times.

*Picture:* The hallway dance (both step left, both step right) next to fixed-delay packets colliding forever vs random ✓✓.


## Part 4 — Building the model

### [Scene 11 — Turning it into math](scenes/s11-the-model.md) · 3:23 · 32 s

> So, how well does this actually work? Let's build a model. First, assume every packet takes the same time to send. We'll call that one frame time, and use it as our unit of time. Second, count every attempt to transmit, new packets and retries alike. With many terminals, each sending only once in a while, what do all those attempts look like? It's the recipe from the start. Lots of rare, independent events. A Poisson process, just like the bus stop. It's an approximation, but a good one.

*Picture:* Bus-stop phones each puff rarely → rows fold into one timeline (same move as Scene 03) → Poisson attempts.

### [Scene 12 — Two numbers: G and S](scenes/s12-g-and-s.md) · 3:56 · 28 s

> We'll call its rate G, the average number of attempts per frame time. G is the offered load. It's how hard everyone is pushing on the channel. What we actually care about is S, the throughput. That's how many packets per frame time actually get through. The channel can carry at most one packet per frame time, so S is also the fraction of the channel doing useful work. And S is simply G, times the chance that an attempt succeeds.

*Picture:* Tower scoreboard: TRIES vs DELIVERED → G and S labels on the timeline → S = G × P(success).


## Part 5 — Pure Aloha

### [Scene 13 — The vulnerable window](scenes/s13-vulnerable-window.md) · 4:25 · 24 s

> So when does a packet succeed? Back to the walkie-talkie. Say you talk for ten seconds. Anyone who starts while you're talking cuts you off. And anyone who started in the ten seconds before you is still talking when you begin. That's twenty seconds of danger. Packets work the same way. My packet is vulnerable for two whole frame times, and it succeeds only if nobody else starts in that window.

*Picture:* A 10-second walkie-talkie message gives 20 s of danger, aligned above packets: vulnerable window = 2 frame times.

### [Scene 14 — Applying the formula](scenes/s14-pure-formula.md) · 4:50 · 27 s

> And this is the bus stop question again. Before, we asked for the chance of no bus for six minutes. Now we want the chance of no other packet for two frame times. Same formula, e to the minus lambda t. Here the rate is G, and the time is two. So the chance of success is e to the minus two G. Multiply by G, and we get the throughput of pure Aloha. S equals G times e to the minus two G.

*Picture:* Split screen: 'no bus for 6 min' above 'no packet for 2 frame times' → e^(−λt) with λ→G, t→2 → S = G·e^(−2G).

### [Scene 15 — The curve](scenes/s15-the-curve.md) · 5:18 · 29 s

> Let's plot it. It behaves a lot like a highway. With light traffic, every packet gets through, but the channel sits mostly empty. Add traffic, and throughput rises. But push too hard, and collisions take over, like a traffic jam, and throughput sinks back toward zero. The peak is at G equals one half, where S equals one over two e. About eighteen percent. Even at its best, more than eighty percent of the channel goes to silence and collisions.

*Picture:* Highway from empty to jammed, driven by the same G cursor that draws the curve. Peak ≈ 18.4%.


## Part 6 — Slotted Aloha

### [Scene 16 — The fix: add a clock](scenes/s16-slotted-fix.md) · 5:48 · 24 s

> A year later, Larry Roberts found a simple fix. Add a clock. Split time into slots, each one frame long, and let packets start only at the beginning of a slot. It's like a meeting room you can only book by the hour. Either two people pick the same hour, or they never clash at all. No more half overlaps. The vulnerable window shrinks from two frame times to just one.

*Picture:* Meeting room booked by the minute (messy overlaps) vs by the hour → slots, window shrinks 2 → 1.

### [Scene 17 — Double the capacity](scenes/s17-slotted-formula.md) · 6:13 · 27 s

> Same formula, new window. The chance of success is now e to the minus G, so S equals G times e to the minus G. The peak moves to G equals one, where S equals one over e. About thirty-seven percent. Just by adding a clock, we doubled the capacity. And that thirty-seven percent? It's our bus stop number again. An average of one arrival in the window, and a thirty-seven percent chance of none.

*Picture:* S = G·e^(−G), peak ≈ 36.8% (×2). Bus-stop '37%' strips rhyme with the slot strips.


## Part 7 — When it breaks

### [Scene 18 — The collapse spiral, and backing off](scenes/s18-collapse-and-backoff.md) · 6:42 · 32 s

> There's one more danger. Past the peak, things get worse on their own. Think of midnight on New Year's Eve, when everyone texts at once and messages keep failing. More collisions mean more retries. More retries mean more load, and even more collisions. The channel can spiral into a jam where almost nothing gets through. The cure is to back off. When you keep colliding, wait longer before trying again. Ethernet, for example, picks its random wait from a range that doubles after every collision.

*Picture:* New Year's Eve midnight texts fail and retry → ball rolls off the curve → doubling backoff range rolls it back.


## Part 8 — Aloha today

### [Scene 19 — Aloha is everywhere](scenes/s19-legacy.md) · 7:14 · 22 s

> And Aloha didn't stay in Hawaii. Bob Metcalfe read about it, and it inspired him to create Ethernet. Its ideas live on in Wi-Fi. And remember the phone at the bus stop? When it first reaches out to a cell tower, it uses a form of slotted Aloha. So do R F I D tags, satellite links, and tiny smart sensors.

*Picture:* Metcalfe and Ethernet, Wi-Fi, and the Commuter's phone reaching the tower in a slot. RFID, satellite, sensors.

### [Scene 20 — Recap](scenes/s20-recap.md) · 7:37 · 32 s

> Let's recap. A Poisson process is random, independent events at a steady rate, like buses in city traffic. The chance of nothing happening for a time t is e to the minus lambda t. Aloha says, send whenever you want, and if you collide, retry at a random time. Treat all the attempts as a Poisson process, and the throughput falls right out. Pure Aloha peaks at about eighteen percent. Slotted Aloha, at about thirty-seven. Not bad, for a system where nobody is in charge.

*Picture:* Recap card with each real-life icon → the bus finally arrives, the Commuter boards. 'Nobody's in Charge'.


---

## Fact sheet (for checking visuals and captions)

| Item | Value |
|---|---|
| Poisson count in window *t* | P(k) = (λt)^k · e^(−λt) / k! |
| P(no events in *t*) | e^(−λt). With 10 buses/hour and t = 6 min: e^(−1) ≈ 0.368 |
| Gaps between events | exponential, mean 1/λ, memoryless |
| Pure Aloha vulnerable period | 2 frame times |
| Pure Aloha throughput | S = G·e^(−2G), max 1/(2e) ≈ 0.184 at G = 0.5 |
| Pure Aloha at G = 0.5, time split | useful ≈ 18.4%, idle e^(−0.5) ≈ 60.7%, collisions ≈ 20.9% |
| Slotted Aloha vulnerable period | 1 frame time (one slot) |
| Slotted Aloha throughput | S = G·e^(−G), max 1/e ≈ 0.368 at G = 1 |
| Slotted at G = 1, slot split | idle ≈ 36.8%, success ≈ 36.8%, collision 1 − 2/e ≈ 26.4% |
| ALOHAnet | Univ. of Hawaiʻi, Norman Abramson, operational 1971, 9,600 bit/s UHF radio, separate outbound frequency for the hub |
| Slotted Aloha | Larry (Lawrence) Roberts, 1972 |
| Ethernet | Bob Metcalfe, 1973, inspired by ALOHAnet; binary exponential backoff |
| Today | cellular random access (initial access), RFID anti-collision, satellite random access, LoRaWAN (pure Aloha) |
