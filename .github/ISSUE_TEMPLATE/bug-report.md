---
name: Bug Report
about: Something isn't working as expected
title: ''
labels: 'Category: bug, needs triage'
assignees: ''

---

<!--
BEFORE FILING: Search open AND closed issues. If your issue already
exists, add a comment or reaction to the existing one instead.
-->

- [ ] I searched existing issues and this is not a duplicate

### What happened?
<!-- Be specific. "It doesn't work" is not a bug report. -->

### Expected behavior
<!-- What should have happened? -->

### Actual behavior
<!-- What happened instead? -->

### How to reproduce
<!--
If you know how to reliably reproduce the bug, you can describe
how to do that step-by-step here. If this is a gameplay bug, it would
help if you attached a small spreadsheet where the bug can be reproduced.

If you don't know how to reliably reproduce the bug, we need three things:
1. A copy of your spreadsheet from a few minutes before the bug occurred.
   You can create this by going through the version history of the sheet
   and making a copy of a version from before the bug occurred, and sharing
   the new copy with us.
2. The data_game.txt.gz file you got from the `.dumplog` command.
3. The data_commands.log.gz file you got from the `.dumplog` command.

Keep in mind that anything you share in this issue will be public. If you're
not comfortable sharing your entire game with the public, you can either
attempt to reproduce the bug by tracing through the version history and
using the command log to repeat the actions that caused it to happen, or
email those files to alteregomolly@pm.me for private investigation.

If you send them via email, please mention that you've done so here.
-->

### Stack Trace
<!--
If you have a stack trace from the console, please paste that here.
Surround it with three tics (```) at the beginning and end for readability.

If you're running Alter Ego in a Docker container, you can check to see if
there's a stack trace by entering `docker compose logs` in the console.
-->

### Screenshots
<!--
If applicable, add screenshots to help explain your problem.
-->

### Environment
<!--
Please run the following command in the terminal in Alter Ego's directory,
and paste the results here:
`npx envinfo --system --npmPackages --binaries`
-->
