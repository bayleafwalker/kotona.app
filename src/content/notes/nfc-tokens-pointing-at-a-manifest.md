---
title: NFC tokens pointing at a manifest
status: prospective
area: hardware contracts
published: 2026-06-10
lastRevised: 2026-06-10
projects: []
tags:
  - hardware
  - contracts
summary: "Cassettes, diskettes, and cartridges as physical handles for digital media. The rule that makes the whole family of projects work: the tag points, it never hosts."
---

A cluster of retro media projects in progress: a cassette shell with decoder electronics, powered inductively through a coil in the player's door; cartridge- and diskette-shaped tokens that select games on a small player; mini diskettes that resolve to music playlists on an ESP32 player, meant to be handed out to family alongside the player — a music library you can physically give someone.

The hardware varies. The architecture is one decision applied three times: NFC tags identify, they never carry. A tag holds a key and nothing else. The key resolves through a manifest — best described as a hosts file for media — with one entry per key: source, destination, protocol. The reader dispatches on protocol: jellyfin, youtube, http, local. Repointing a token means editing a text file, not reprogramming a tag that may be glued inside a cassette shell in someone else's house.

The manifest lives somewhere boring with git history, which turns out to be most of the value. "What did this diskette point at last year" is a log lookup, and a bad repoint rolls back. Because the manifest layer is public, it carries no credentials — those live in each reader's local config, so the contract layer stays publishable and the secrets stay at the edge where they belong.

The failure mode worth designing against is the one Toniebox-style products ship with: a keepsake whose function depends on a link staying alive. These tokens are gifts, and a gift shouldn't have planned obsolescence built in. So readers cache last-known-good resolutions, and the pre-loaded variants exist precisely so the physical object outlives the playlist, the server, and if necessary the curator's infrastructure.

One fork deliberately left open per project: key on the tag's factory UID, or on a value written to tag memory. UID keying makes tokens unforgeable but requires enrolling every physical tag into the manifest; written keys make tokens interchangeable and freely reskinnable. Tamper-resistance points one way, reskinnability the other, and a game cartridge and a gifted diskette can reasonably choose differently.

This sits in a different register from the rest of the site, but it's the same instinct in a toy shell: a thin, versioned contract between the thing you hold and the thing it means, so either side can change without breaking the other.
