# Log Forge

Discrete logarithms · generic algorithms · Pohlig–Hellman · index calculus

## What It Is

A browser-only laboratory that actually recovers discrete logarithms in finite fields, their prime-order subgroups, and a verified toy elliptic curve. It also shows how a validated static-DH oracle can surrender its long-lived exponent through Cheon’s attack. Every displayed exponent is checked with independent arithmetic before display. It is a teaching demo, not production cryptography.

Built to the [Crypto Lab master template](https://github.com/systemslibrarian/crypto-lab/blob/main/audits/_MASTER-TEMPLATE.md). The original brief is included; scope corrections below are deliberate. Fleet chrome and accessibility machinery derive from MIT-licensed Crypto Lab work by Paul Clark.

## Exhibits

1. **Solver race:** brute force, BSGS, Pollard rho with Floyd, kangaroo, Pohlig–Hellman and index calculus. Actual generator orders and membership are checked first.
2. **Digit lifting:** prime-power digits, verified projections and CRT; a certified 128-bit smooth-order modulus; safe-prime and ZK Arena partial leaks.
3. **Tables and walks:** recorded baby/giant steps, rho exponent-pair collisions and measured tail/cycle lengths, and tame/wild kangaroo jumps. Step controls expose the actual records. Long traces are sampled.
4. **Index calculus:** smooth relations, full-rank linear algebra modulo q, Euler parity modulo 2, and CRT. Keep one precomputation and solve several targets. A fixed p=101 trace checks all four non-field division candidates.
5. **Weak group forge:** fresh targets with smooth order, short exponents, a small field, or a prime-order toy curve. Every solver gets the same calibrated budgets, and every outcome is shown.
6. **Cost and key lengths:** separate field/order axes, formula lines, discrete measured points, NIST's classical-strength table, and the historical Logjam results.
7. **Static DH oracle:** Cheon’s q−1 attack recovers a static Diffie–Hellman key from d validated oracle answers, then recomputes query-budget divisors for three real group orders.

## When to Use It

Teach why field size, order factorization, group representation and exponent range all matter. Prime order removes a smoothness advantage; it does not make a tiny field safe. Generic algorithms run unchanged over the curve and field group interfaces.

## Live Demo

[Log Forge](https://systemslibrarian.github.io/crypto-lab-log-forge/). Pages publication follows unit, browser claims, accessibility and concrete mutation gates.

## What Can Go Wrong

- Generic BSGS/rho search the square root of the **order being searched**. The largest-prime-factor statement applies after Pohlig–Hellman decomposition; it is not a universal cost for an unsplit solver.
- A 128-bit modulus with smooth order can give up its exponent. The fixture carries a Lucas certificate using the complete factorization of p−1.
- Rho restarts on degenerate congruences. Non-invertible coefficients are gcd-reduced, and candidate exponents are checked.
- A partial CRT result is a congruence, not a full logarithm. Large digits are explicitly skipped.
- General index calculus is restricted to safe-prime fixtures below 2^64. Rank deficiency never yields an arbitrary answer. Subgroup logs lift through a full generator, then divide by the cofactor.
- A fair toy race can have several winners, including brute force on a tiny prime-order curve. The brief's exclusive-winner rule is replaced with disclosed equal budgets and actual outcomes; caps are not tuned to manufacture a result.
- Failed or capped attacks establish no security claim. Stopped runs do not report an invented memory count: it is marked “not captured.” Successful memory counts are group/table records, excluding traces and arithmetic temporaries.
- The static-DH exhibit implements only Cheon’s q−1 construction. It shows q+1 divisors but never attacks them. Its square-root speed-ups count search steps; each Cheon step is an exponentiation, so the group-operation saving is smaller.
- BigInt is variable-time. Browser measurements are not attack-cost forecasts. Input changes retire results; cancellation terminates a fresh worker. A bounded main-thread fallback is explicitly disclosed if workers cannot be created.

## Real-World Usage

Discrete-log assumptions support DH and many signatures/proofs. Classical generic attacks motivate large prime subgroup orders; finite-field index calculus requires much larger fields. A static key holder that returns raw v^α values adds a separate oracle-query attack surface. NFS is a formula here, not implemented. The 2015 Logjam measurements are attributed to the authors' infrastructure and vulnerable servers at that time.

Primary references: Katz–Lindell third edition Chapter 10; [HAC §3.6](https://cacr.uwaterloo.ca/hac/about/chap3.pdf); [Pollard 1978](https://doi.org/10.1090/S0025-5718-1978-0491431-9); [Pohlig–Hellman 1978](https://doi.org/10.1109/TIT.1978.1055817); [Shoup 1997](https://www.shoup.net/papers/dlbounds1.pdf); [Logjam](https://weakdh.org/imperfect-forward-secrecy-ccs15.pdf); [NIST SP 800-57 Part 1 Rev 5 Table 2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf); [Boneh–Shoup v0.6 §16.1.4 and Exercise 16.3](https://toc.cryptobook.us/); [Cheon, EUROCRYPT 2006](https://iacr.org/archive/eurocrypt2006/40040001/40040001.pdf); and [RFC 9497 §7.2.3](https://www.rfc-editor.org/rfc/rfc9497#section-7.2.3). The NIST ECC ranges are preserved rather than presented as exact equalities.

## How to Run Locally

Node 22 or newer:

```sh
npm ci
npm run dev
```

## Related Demos

[Factor Forge](https://systemslibrarian.github.io/crypto-lab-factor-forge/), [ZK Arena](https://systemslibrarian.github.io/crypto-lab-zk-arena/), [ElGamal Plain](https://systemslibrarian.github.io/crypto-lab-elgamal-plain/), [DH MITM](https://systemslibrarian.github.io/crypto-lab-diffie-hellman-mitm/), [Function Key](https://systemslibrarian.github.io/crypto-lab-function-key/), [Curve Lens](https://systemslibrarian.github.io/crypto-lab-curve-lens/), [Hash Hunt](https://systemslibrarian.github.io/crypto-lab-hash-hunt/).

The overlap review matches the sibling commits pinned in the brief. ZK Arena already implements partial Pohlig–Hellman; its parameters, not its attack code, are reused as a cross-implementation fixture. Existing BSGS attacks remain linked. Log Forge adds digit lifting, a generic cross-representation comparison and real index-calculus precomputation.

## Build & Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:mutations
```

32 local unit tests pass. They cover the three K–L worked examples, all four generic methods in both representations, membership, Hasse-certified curve order, the 128-bit Lucas certificate, PH's measured operation advantage on a prime-power subgroup, ZK Arena's 564522-modulus partial leak, rank deficiency, every collected relation, Euler parity, subgroup lifting, independent verifier isolation, worker decimal serialization, the static-DH fixture and oracle boundary, Cheon recovery for every offered d, and multiply-back/primality checks for every real-group factor. No coverage percentage is claimed.

Thirteen browser claims independently exponentiate displayed answers, check CRT residues, rederive index relations, verify the oracle chain and recovered key, recompute real-group factors/divisors, verify negative claims, inspect trace controls and assert stale-result retirement. Fourteen concrete mutations must build, move bundle bytes, fail a previously passing named claim, restore exactly and pass again. Accessibility drives the production build at 1280/320 pixels through success, refusal, intermediate trace and disclosure states using unchanged fleet contrast and non-text oracles.

Browser verification runs in CI when supported local browser control is unavailable. Pages and grouped Dependabot auto-merge are gated on the full suite. PR checks, manual dispatch, per-ref concurrency and post-merge deployment dispatch are included.

## Performance

Each original race calibrates primitive group-operation throughput in the executing browser, then applies the same 2,000–100,000-operation and 3-second caps to every method. The static-DH race measures Cheon first and applies one disclosed, larger cap to Cheon, generic BSGS, and rho. Exponentiation expands into counted operations; inversions count once and are separately reported. Oracle queries and server work are reported separately from attacker work. Index linear-algebra scalar operations are separate. A method can refuse a table or interval before allocating unbounded memory. Independent verification is outside attack counts.

Real-size groups appear only in formulas and the key-length table. The inspectable smooth-order and partial-leak fixtures demonstrate weaknesses; they are not production parameters. Elementary index-calculus asymptotics omit the unspecified constant and are not numerical predictions.

The Crypto Lab catalog integration records this lab’s concept, level, source evidence and fleet automation. Playwright port 4227 is unique across all 223 registered configurations; strictPort is enforced and existing servers are never reused.

---

*One of the browser demos in the [Crypto Lab](https://crypto-lab.systemslibrarian.dev/) suite.*

*"So whether you eat or drink or whatever you do, do it all for the glory of God." — 1 Corinthians 10:31*

### Static-DH correction

A failed first Cheon search reports only the table it actually built. Out-of-range
oracle inputs still count as queries and validation checks, but do not charge a
membership exponentiation that was skipped. The page now distinguishes its fixed
raw-answer oracle from TLS: RFC 8446 §§7.1 and 7.4 feed the DH secret into HKDF;
key reuse alone does not expose this oracle. RFC 9497 §7.2.3 supplies the OPRF
connection. Mutation replay requires the owning assertion in a structured report;
crashes, skipped tests, and setup failures cannot count as kills.
