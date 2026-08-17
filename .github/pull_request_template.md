## What changes, and why

<!-- What a reviewer needs to know to judge this. Not a list of files — the
     reason it exists. -->

## How it was checked

<!-- What you ran or clicked. The automated checks cover lint, the server
     tests, a browser driving the built site, and the image building; say what
     you verified beyond them, and say plainly if something is unverified. -->

## Compliance read

This site is published by an IRDAI-registered Insurance Marketing Firm, so some
changes need more than a code review. Tick what applies, or delete the section
if none of it does.

- [ ] Adds or changes a **figure, projection or assumption** shown to a visitor
- [ ] Adds or changes **regulatory wording** — registration numbers, ARN,
      disclaimers, grievance routes
- [ ] Makes a claim about **outcomes, clients, performance or credentials**
- [ ] Changes how an **enquiry** is captured, stored, transmitted or retained
- [ ] Changes what is **collected about visitors**, or how long it is kept

> Nothing merged here may state a client, a revenue figure, an award, a
> statistic, a testimonial, a certification, a partnership or a case-study
> result that has not been verified. Illustrative figures must be labelled as
> illustrative where they are shown.

## Secrets

- [ ] No key, token or credential is in the diff, in a client-side bundle, or
      in a committed file
- [ ] Anything new that is configurable is read from an environment variable or
      a repository variable, not hardcoded
