# Build brief — `crypto-lab-log-forge`

**2026-10-20. Brief only; no repository exists yet.** Written against
`audits/_MASTER-TEMPLATE.md` (catalog `f48d9d2f2f06`). §0 through §6 apply unchanged.
Source of the gap: Katz–Lindell, *Introduction to Modern Cryptography*, 3rd ed., Chapter 10:
§10.2–10.2.3, §10.3, §10.4 and Figure 10.1.

**Verdict: new repository.** It is the discrete-log sibling of `crypto-lab-factor-forge` and
reuses that lab's shape: a race, a trace, a ladder, a weak-input forge, and an independent
verifier.

```
NEW DEMO BRIEF
- Repo name:         crypto-lab-log-forge
- Short name (H1):   Log Forge
- Subtitle:          Discrete logarithms · generic algorithms · Pohlig–Hellman · index calculus
- One-liner:         Solves g^x = h for real in Z*_p, in its prime-order subgroups, and on a toy
                     prime-order elliptic curve, using brute force, baby-step giant-step,
                     Pollard rho, Pollard kangaroo, Pohlig–Hellman and index calculus. Every
                     answer is checked by an independent exponentiation.
- Concept to teach:  A discrete log is as hard as the group lets it be. Generic algorithms pay
                     about the square root of the LARGEST PRIME FACTOR of the group order, and
                     Pohlig–Hellman makes the rest of the order free, which is why we use
                     prime-order groups. In Z*_p, index calculus goes below even that
                     (sub-exponential in the size of p). No such algorithm is known for
                     well-chosen elliptic curves, which is why EC keys are shorter.
- Primitives/spec:   K-L §10.2.1 (Pohlig–Hellman), §10.2.2 (BSGS, Algorithm 10.6), §10.2.3
                     (discrete logs from collisions), §10.3 (index calculus), §10.4 and Fig. 10.1
                     (key lengths); Pollard 1978 (rho for logs; kangaroo); Pohlig–Hellman 1978;
                     Shanks 1971; Adleman 1979; Shoup 1997; Adrian et al. 2015 (Logjam);
                     NIST SP 800-57 Pt 1 Rev 5, Table 2
- Accent (--accent): [central assignment]
- Favicon emoji:     [central assignment]
- Category:          [central assignment]
- Section (suggested): cryptanalysis (Factor Forge's section)   Level (suggested): Intermediate
- In scope:          three groups: Z*_p (composite order), the prime-order subgroup of a
                     safe-prime Z*_p, and a toy prime-order curve over F_p (generic algorithms
                     only). Algorithms: brute force; BSGS; Pollard rho for logs (three-way
                     partition walk + Floyd); kangaroo for x in [a, b]; Pohlig–Hellman with
                     digit-by-digit prime-power lifting (K-L Ex. 10.5); index calculus in Z*_p
                     for safe primes (factor base → smooth relations → linear algebra → the
                     individual log), with K-L Example 10.8 as a fixed trace; a Weak Group
                     Forge; a cost ladder; a key-length table; a Logjam stakes card
- Non-goals:         the number field sieve (a labelled cost formula only, as in Factor Forge);
                     pairing-transfer (MOV) and anomalous-curve attacks; point counting
                     (toy curves come from a verified fixture); Shor (link); any real-size group
                     (cost lines only)
```

## Overlap check — what I read, and what I found

All labs below were opened from source at the commit shown.

- **Factor Forge** (`8fd7436210e0`) is the structural model.
  - `src/factor/` holds one module per method, plus a shared registry and `types.ts`.
  - `src/gen/weak.ts` is the Weak N Forge. Its README (Exhibit 4) says nothing is returned until
    the targeted method has factored the number *and* the other methods have failed.
  - `src/verify/verify.ts` is the verifier. It imports no algorithm module, and
    `src/verify/verify.test.ts:52` asserts that mechanically. The comment at `verify.ts:8`
    names a `verify.import-isolation.test.ts` that does not exist; the check is in
    `verify.test.ts`. Copy the test, not the comment.
  - `src/worker/protocol.ts` sends BigInts across the worker boundary as decimal strings.
  - `src/ui/ladder.ts:255,341` prints the NFS cost as a labelled formula, `L_N[1/3, 1.923]`.
  - Log Forge mirrors all of these. Its rho is Brent's (`src/factor/rho.ts:2–14`). Log Forge
    uses Floyd, matching K-L §10.2.3's reference to Algorithm 6.9, and says so.
- **ZK Arena** (`214c05725a19`) **already runs a real Pohlig–Hellman.** Do not claim it is
  absent. `src/pohlig.ts:118 pohligHellman()` attacks its own toy group: Z*_p mod the secp256k1
  field prime, g = 5, p − 1 = 2·3·7·13441·q′ (q′ 237-bit; `src/groups.ts:55–80`).
  - It projects into each prime-power subgroup and solves there with one BSGS of size √(p^e)
    (`bsgs(gi, yi, power, p)`, `:149`), then combines the results with CRT.
  - Factors ≥ 2^24 are reported with their cost and **not attempted**
    (`FEASIBLE_FACTOR_BOUND`, `groups.ts:146`). The result is a *partial leak*:
    x mod 564522, about 19.11 bits.
  - It also has a `legendreProbe` (`pohlig.ts:208`) showing that the safe-prime group leaks
    nothing through the Legendre symbol.
  - **Decision: link, don't port the attack.** In ZK Arena, Pohlig–Hellman is a disclosure
    about *that lab's* parameters. Log Forge needs the full algorithm, including K-L Exercise
    10.5's digit-by-digit lifting (cost Σ e_i·√p_i rather than √(p_i^e_i)), and writes its own.
  - Reuse ZK Arena's TOY_GROUP *parameters* as a cross-implementation fixture, with a provenance
    comment naming the commit (see Tests). Its MIT-licensed `crt`/`modInverse` helpers may be
    ported with attribution if convenient.
- **ElGamal Plain** (`207b757ca04d`): BSGS over the order-q subgroup, `src/attacks.ts:35`,
  guarded by `MAX_FEASIBLE_ORDER = 2^26` (`:5`). A single method as an attack on a key.
- **DH MITM** (`f5679cc9b202`): BSGS over the *full* group, order p − 1 (`src/engine.ts:135`,
  called at `src/ui.ts:307`), with a √p cost chart.
  - *Correction to the brief that commissioned this one:* this is Z*_p, not a toy elliptic
    curve. The "Do not generalize that curve" note (`src/ui.ts:346`) refers to the *cost curve*.
    That note already points at the number field sieve and Logjam.
  - Log Forge is where that pointer gets the algorithms behind it.
- **Function Key** (`5d3d445b0073`): BSGS over ristretto255 for a log known to lie in a bounded
  range (`src/crypto/dlog.ts:130 dlogSymmetric`), as the decryption bottleneck. That is exactly
  the job the kangaroo does in constant memory. Cross-link both ways.
- **Key Exchange** (`88e5a0a1a268`): naive brute-force DL with cost tiers. Index calculus appears
  only in a code comment (`src/ui.ts:404`), a tier label (`:430`), a footnote (`:459`) and
  `src/data.ts:32`.
- **Curve Lens** (`af90e0db7a4c`, `src/curve.ts:359`) and **Point Arithmetic** (`f4699df6e28b`,
  `src/ui/panel-hard.ts`) brute-force the ECDLP on toy curves.
- **Shor** (`79a145deb8dd`) says in prose that Shor solves discrete logs (`index.html:375`). It
  performs no DL computation.

In this session's sibling clones, a grep of `*.ts`, `*.html` and `*.js` (excluding tests, e2e
and lockfiles) for `kangaroo|index.calculus|pollard…rho…log|pohlig` found:
- ZK Arena's Pohlig–Hellman;
- the Key Exchange and DH MITM prose above;
- the word "kangaroo" in a BIP-39 wordlist (`crypto-lab-bitcoin-wallet/src/wordlist.ts:128`).

**The agent re-runs this grep before building and reports anything new.**

## SCOPE

0. **What is this.** Plain language, no maths. Raising g to a secret power is easy and undoing
   it is hard, but *how* hard depends on the group. This lab runs every classical way of undoing
   it, so you can see which property of the group each one feeds on.
1. **Solve h (the race).** Pick a group and h, or forge one. Run any method or race all of them.
   Each row reports one of: solved and verified, gave up (with the reason), or not applicable
   (with the reason, e.g. "index calculus needs Z*_p"). Rows show measured group operations,
   memory and time.
2. **Pohlig–Hellman.** Show the order's factorization. Project h into each prime-power
   subgroup, lift digit by digit, then combine with CRT. Show a per-factor cost bar.
   - Preset: K-L Example 10.5 (Z*_31, g = 3, h = 26 → x = 5).
   - Then a 128-bit p with smooth p − 1, solved completely in milliseconds.
   - Then a safe prime, where PH recovers only x mod 2. Link ZK Arena: the same attack as a
     partial leak against a 256-bit modulus.
3. **Square-root algorithms.** BSGS with its table (preset: K-L Example 10.7, Z*_29, g = 2,
   h = 17 → 21). Pollard rho as a tortoise/hare walk over (a, b) exponent pairs, ending in the
   congruence (b − b′)x ≡ a′ − a (mod q). Kangaroo, with tame and wild walks and a trap, for
   x ∈ [a, b]. All three run unchanged on the toy elliptic curve. That is the point of
   "generic", and invariant 2 enforces it.
4. **Index calculus** (Z*_p, safe primes p = 2q + 1, g a generator of Z*_p).
   - Step 1, independent of h: choose B, find relations g^{x_i} = ∏ ℓ_j^{e_ij} that are
     B-smooth, and solve for log_g ℓ_j. Work mod q over F_q by Gaussian elimination, and mod 2
     by Euler's criterion: log_g ℓ is even iff ℓ^q ≡ 1 (mod p). Combine with CRT mod 2q.
   - Step 2: find r with g^r·h smooth, then read off log_g h.
   - Fixed trace of K-L Example 10.8 (p = 101, g = 3, h = 87 → 40). This is where the
     non-prime modulus bites: 4·log 2 ≡ 16 (mod 100) leaves four candidates, and the trace
     tests each (K-L footnote 3).
   - **Precompute once, then solve many h.** Step 1 depends only on (p, g) (K-L §10.3). Label it
     the small-scale analogue of Logjam's per-prime NFS precomputation. It is an analogy, not
     NFS.
5. **Weak Group Forge.** Pick a weakness and get a group that has it:
   - smooth order → PH wins;
   - short exponent x < 2^k → kangaroo wins;
   - prime-order subgroup of a modest p → index calculus beats √q;
   - prime-order toy curve → only √q works.
   Nothing is returned until the targeted method has solved it *and* the others have failed
   within their caps (Factor Forge's rule).
6. **The ladder.**
   - Generic methods plotted against bits of the largest prime factor of the order.
   - Index calculus plotted against bits of p.
   - Your measured runs on the same axes.
   - The NFS curve L_p(1/3, (64/9)^{1/3}) as a labelled formula only.
   - K-L gives index calculus as 2^{O(√(log p · log log p))} with no constant, so show its
     *shape* with the constant omitted and say so.
7. **Key lengths and stakes.**
   - K-L Figure 10.1. For 112/128/192/256-bit security: p 2048/3072/7680/15360 with q
     224/256/384/512, and EC order 224/256/384/512. Explain *why* q is 2n bits (generic √q) but
     p is much longer (index calculus/NFS).
   - The Logjam card (Adrian et al. 2015): 512-bit export-grade DH; about 7 days of
     precomputation per prime; a median of 70 s per individual log; 82% of vulnerable servers
     used a single 512-bit group.

Non-goal notes in-page, one line each:
- NFS: "a cost formula, not an implementation".
- MOV and anomalous curves: "curves where EC logs DO transfer to easier problems — future
  extension".
- Point counting: "toy curves are a verified fixture".
- Shor: link.

## SECURITY / CORRECTNESS INVARIANTS

1. **Verify before display.** Every x is shown only after `src/verify/verify.ts` recomputes g^x
   and compares it to h, using its own arithmetic (its own modpow and its own EC double-and-add).
   The verifier imports nothing from `src/group/` or `src/dlog/`. Copy Factor Forge's
   `verify.test.ts:52` import-list assertion.
2. **Generic means generic.** Modules in `src/dlog/generic/` import only the `Group` *type* from
   `src/group/types.ts`: identity, op, inverse, pow, equals, an opaque `encode()` and order. A
   test asserts the import list, so BSGS, rho and kangaroo provably cannot touch residues mod p.
   Rho's three-way partition reads only `encode()`.
3. **Index calculus refuses what it does not support.** It runs only in Z*_p, and only for
   safe-prime p, where both moduli of the linear algebra (q and 2) are fields. For anything else
   it says why, never a guess. K-L Example 10.8 is the one composite-modulus case, as a fixed
   trace.
4. **Rank before answers.** If the relation matrix is rank-deficient mod q, collect more
   relations. Never pick one of several solutions silently.
5. **Membership first.** h must be in ⟨g⟩ (h^ord(g) = 1, with ord(g) computed from the
   factorization). Otherwise refuse and say why.
6. **Caps are measured, not assumed.** Every method has a step cap and a time cap set from
   in-browser measurement. Hitting one is reported as "gave up at the cap", which is a result,
   not a failure.
7. **Counts are counted.** Group operations are counted by an instrumented `Group` wrapper.
   Formula values are labelled "predicted" or "formula".
8. **The fixture curves are proven, not trusted.** Each toy curve's order is pinned by a test,
   with no point counting needed. Given a point G with qG = O, q prime, and q inside the Hasse
   interval [p+1−2√p, p+1+2√p] with q > 4√p, the interval holds exactly one multiple of q, so
   #E = q.
9. **No real-size claim.** Real groups appear only as cost lines and in the key-length table.

## ARCHITECTURE

```
src/group/types.ts         Group interface (the only import allowed in generic/)
src/group/zp.ts            Z*_p and its subgroups; order from factorization
src/group/ec.ts            toy short-Weierstrass curve, prime order
src/group/fixtures.ts      toy curves + safe primes, with provenance; Hasse check in tests
src/group/counted.ts       instrumented wrapper (op/pow counts)
src/nt/{modarith,primality,factor,crt}.ts
src/dlog/generic/{brute,bsgs,rho,kangaroo}.ts
src/dlog/pohlig.ts         projection + digit lifting; calls a generic solver per prime
src/dlog/index/{factorbase,relations,linalg,individual}.ts
src/gen/weak.ts            Weak Group Forge (mirrors factor-forge src/gen/weak.ts)
src/verify/verify.ts       independent check; imports neither src/group nor src/dlog
src/worker/                off-thread runs; BigInt as decimal strings (factor-forge protocol)
src/ui/{race,trace,ladder,forge,keylengths,why}.ts
```

Primality: port Factor Forge's `src/factor/primality.ts` Miller–Rabin with attribution and its
commit, or write one. Either way, test it against known primes and Carmichael composites. Native
BigInt only; no crypto library is needed, and nothing hides the arithmetic the lab teaches.

## UI

- **Race:** a group picker (Z*_p · subgroup · toy curve), h input or "random x", and a "Run all"
  button. One row per method shows verdict, operations, memory, time and the reason.
- **Trace:** step controls for each method:
  - the BSGS table filling, then the giant-step hit;
  - the rho walk drawn as a ρ from measured tail and cycle;
  - the kangaroo jumps along a number line;
  - PH's residue table and CRT;
  - index calculus as a matrix of exponent vectors with the factor base as columns.
- **Ladder:** log-scale cost against bits, with measured points over formula lines.
- **Forge:** a weakness picker and bit size; returns parameters plus the evidence row.
- Stacks below 640px. Every run is cancellable, and a stale result is retired (Function Key's
  cancellation rule, `src/ui/search.ts:1–15`).

## VISUAL SEMANTICS

- Colour tracks the *group's* security, not "the button worked". A solved log is **ALARM**
  for the group ("SOLVED: this group gives up its keys").
- "Gave up at cap" against a strong group reads as the group holding.
- The negative-claim fixtures read **"PRIME ORDER — AND SOLVED"** and **"128-BIT MODULUS — AND
  SOLVED"** (§4.1d).
- Never colour alone: use icon, text and colour. Check in grayscale and deuteranopia.
- Plot measured runs as points, never as a smooth curve.

## EDGE CASES

| Input | Behaviour |
|---|---|
| h ∉ ⟨g⟩ | refused, showing the failed membership check |
| g not a generator of the stated group | order recomputed from the factorization; mismatch explained |
| order factorization unknown | PH shows "not applicable: needs the factorization of the order" |
| h = 1 or h = g | x = 0 or 1, still verified (no special-casing in the display) |
| rho with b ≡ b′ (mod q) | counted restart from a fresh random (a₀, b₀) |
| kangaroo with x outside [a, b] | "not found in interval" at the cap, never a wrong x |
| index calculus with non-safe-prime p | refused with invariant 3's reason |
| B too small (no relations within cap) | says so, and suggests the B the ladder predicts |
| point not on the curve / point at infinity as h | rejected / x = 0 |
| input changed mid-run | cancelled; old verdict marked "retired: inputs changed" |

## EXTENSION SEAMS

- `// [extension] point` in `src/group/ec.ts`: curves where EC logs transfer to easier problems
  (pairing-transfer/MOV, anomalous). Not built. The panel says such curves exist and are
  avoided.
- `// [extension] point` in `src/dlog/generic/rho.ts` and `kangaroo.ts`: distinguished points
  and parallel search (van Oorschot–Wiener, J. Cryptology 12(1), 1999).
- `// [extension] point` in `src/dlog/index/`: a composite-modulus solver (Hensel lifting per
  prime power), lifting invariant 3's safe-prime restriction.

## Tests

**Worked-example vectors** from K-L, recomputed rather than trusted: Ex. 10.5 (31, 3, 26 → 5),
Ex. 10.7 (29, 2, 17 → 21), Ex. 10.8 (101, 3, 87 → 40, including log₃2 = 29). These were checked
here by direct modular exponentiation. Label them "K-L worked examples", not standard vectors.

**Cross-implementation fixture.** Use ZK Arena's TOY_GROUP *parameters*: p = 2^256 − 2^32 − 977,
g = 5, p − 1 = 2·3·7·13441·q′, with q′ copied from `crypto-lab-zk-arena/src/groups.ts`
(`TOY_Q_PRIME`) at `214c05725a19`. The test:
- re-verifies the factorization;
- checks that 5 is a primitive root (5^((p−1)/f) ≠ 1 for every prime f);
- runs Log Forge's own PH on a fresh key, recovers x mod 564522, and checks it against the
  secret;
- asserts log₂ 564522 ≈ 19.11, the figure ZK Arena prints.

Two independent implementations, one expected answer.

**Unit tests (Vitest):**
- each generic method on Z*_p subgroups *and* the toy curve;
- the PH digit-lifting operation count is below the single-BSGS count for a p^e factor;
- Euler-criterion parity matches brute-force parity on small p;
- the rank-deficiency path;
- the Hasse-interval proof for every fixture curve;
- the import-list tests for invariants 1 and 2.

**`e2e/claims.spec.ts` (§4.1b):**
- parse p, g, h, x from each verdict and recompute g^x mod p in the test with its own BigInt
  modpow;
- PH: parse the residue/modulus table, CRT it in the test, and compare to the shown x;
- index calculus: parse every displayed relation and recompute both sides;
- race: every "solved" row re-verifies, and every "gave up" row shows ops ≥ its cap or a
  stated reason;
- ladder: measured points carry the run's own op counts;
- retirement on input change, and the no-op guard.

**§4.1c mutations, one per rendered verdict.** Each must turn a NAMED test red, with the
baseline passing, a non-empty diff and the bundle hash moved:
- verifier compares g^(x+1);
- CRT uses the wrong modulus;
- rho drops the b ≡ b′ restart and solves with a non-invertible coefficient;
- Euler-criterion parity inverted;
- kangaroo reports success without a trap hit;
- the Forge returns a group the targeted method did not actually solve;
- index calculus skips the rank check.

**§4.1d negative claims, each scoped to this lab's constructions:**
- **Fixture A.** "A prime-order subgroup stops Pohlig–Hellman; in Z*_p it does not stop index
  calculus — only the size of p does." Setup: h in the order-q subgroup of a toy safe prime.
  Every check is green: PH has nothing to split (the order is prime, so it reports "no
  factor to exploit"), BSGS and rho give up at the √q cap, and membership is verified. Index
  calculus, working through a generator of the full Z*_p, still recovers x, and the verifier
  confirms it. (Contrast Act 2, where the *full* group Z*_p leaks x mod 2 to PH.)
  Verdict: "PRIME ORDER — AND SOLVED".
- **Fixture B.** "A large modulus is not a large discrete log." Setup: a 128-bit p with smooth
  p − 1, whose bit length passes the page's size readout. PH solves x completely, and the
  verifier confirms it. Verdict: "128-BIT MODULUS — AND SOLVED".

## Honesty notes for the page

- Every algorithm is real and runs at toy sizes. Real groups appear only as cost lines.
- The generic lower bound (Shoup 1997; Nechaev, cited by K-L) holds for algorithms that use only
  group operations. Index calculus is fast precisely because it uses more than that.
- "No sub-exponential algorithm is known for well-chosen elliptic curves" (after K-L §10.2) is
  a statement about *known* algorithms, not a proof.
- The index calculus here is K-L's textbook version. It is not the number field sieve.
- Timings are this browser on this machine.
- Not production crypto. A teaching demo.

## Links out

Factor Forge (the factoring sibling) · ZK Arena (Pohlig–Hellman as a partial leak against its
own 256-bit toy group) · ElGamal Plain and DH MITM (BSGS as the key-recovery step) · Function
Key (bounded-range BSGS, the kangaroo's job) · Curve Lens and Point Arithmetic (the ECDLP) · Key
Exchange (cost tiers) · Shor (the quantum answer) · Hash Hunt, proposed in this batch (Floyd's
cycle finder, the same one rho uses here, K-L §10.2.3).

## Sources (verified 2026-10-20 unless marked)

- J. Katz, Y. Lindell, *Introduction to Modern Cryptography*, 3rd ed., CRC Press, 2021, ISBN
  9780815354369. Checked in the book text: Ch. 10 §10.2–10.4, Examples 10.5/10.7/10.8, Fig. 10.1,
  and Exercises 10.5–10.7.
- J. M. Pollard, "Monte Carlo methods for index computation (mod p)," *Math. Comp.* 32(143):
  918–924, 1978, doi:10.1090/S0025-5718-1978-0491431-9. Checked at the AMS DOI. Rho for logs
  and the kangaroo, per K-L's Ch. 10 notes.
- S. C. Pohlig, M. E. Hellman, "An improved algorithm for computing logarithms over GF(p) and its
  cryptographic significance," *IEEE Trans. Inf. Theory* 24(1):106–110, 1978,
  doi:10.1109/TIT.1978.1055817. Checked via Crossref.
- D. Shanks, "Class number, a theory of factorization, and genera," *Proc. Symp. Pure Math.* 20
  (1969 Number Theory Institute, ed. D. J. Lewis), AMS, 1971. Series, volume, editor and year
  were checked in a library catalog record. Pages 415–440 are from K-L's bibliography only.
- L. M. Adleman, "A subexponential algorithm for the discrete logarithm problem with applications
  to cryptography," 20th FOCS, IEEE, 1979, pp. 55–60. Checked against cr.yp.to's bibliography and
  K-L.
- V. Shoup, "Lower bounds for discrete logarithms and related problems," EUROCRYPT '97, LNCS
  1233, pp. 256–266, doi:10.1007/3-540-69053-0_18. The DOI was checked at doi.org; pages are from
  K-L and the Utah LNCS index (start page 256).
- D. Adrian et al., "Imperfect Forward Secrecy: How Diffie-Hellman Fails in Practice," ACM CCS
  2015, pp. 5–17, doi:10.1145/2810103.2813707. Checked via Crossref. The figures above are from
  the paper:
  - abstract: 82%, single 512-bit group;
  - §3.3: 7 days of precomputation per prime; median 70 s per log;
  - §2: NFS running time L_p(1/3, (64/9)^{1/3}).
- NIST SP 800-57 Part 1 Rev. 5, *Recommendation for Key Management*, May 2020, Table 2
  (§5.6.1.1). **[PARTLY VERIFIED]** The proxy refused nvlpubs.nist.gov, so the PDF's table was
  not opened. The values match K-L Figure 10.1, which cites Rev. 4 (2016), and the keylength.com
  summary of Rev. 5. **The agent confirms the values against the Rev. 5 PDF before rendering
  them.**
