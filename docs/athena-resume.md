# Resuming a discovery session

A client who stops halfway now comes back to the next question instead of the
first one. This is how that works, and the one change it still needs on the
ElevenLabs side.

## The short version

Every discovery session is written to the encrypted store as it happens, turn by
turn. When a client reopens their onboarding link, the server looks for a
session of theirs that is unfinished and recent, hands it back, and both Athenas
carry on from where it stopped.

- **Text session: working now.** Nothing outside this repo is needed.
- **Voice session: the client's answers are saved, shown, and never lost, and
  Athena still starts from the top until the agent prompt reads the two
  variables below.**

## What decides whether a session resumes

`findResumableSession` in `lib/athena/discovery-sessions.ts`. A session is
offered back when all of these hold:

| Condition | Why |
|---|---|
| It has at least one turn | Nothing to restore otherwise |
| It never completed | A submitted fact find is finished work |
| No later session of theirs completed | They got there in the end |
| Last activity within `RESUME_WINDOW_DAYS` (14) | Older financial answers are stale, and a three week old conversation should start fresh |

Past 14 days the session stops being a live task and becomes history: it stays
readable in the CRM, it is just no longer offered back to the client.

## Threads: one conversation, more than one record

A text session that resumes reuses its conversation id, so its record simply
grows. A voice session cannot, because ElevenLabs mints a new conversation id
for every call. So each record carries a `threadId`, set once when the record is
created and never movable afterwards. `buildDiscoverySessions` groups records by
thread and keeps the longest turn list, which is safe because a resumed session
seeds itself with the previous turns before it adds any new ones.

That is why the adviser sees one session that was resumed once, rather than two
sessions that each look abandoned.

## What the adviser sees

- **Client overview** shows a single notice when a client has an unfinished
  session, with what was captured and when they stopped.
- **Fact find review** shows every session for that client, its status, how many
  answers it captured, and the full transcript on expand.

Status maps exactly to what the client can still do, so the two screens never
disagree: `live` (writing within the last five minutes), `paused` (stopped, still
resumable), `abandoned` (stopped, past the window), `completed`.

## The one change still needed: the ElevenLabs agent prompt

The browser already sends two dynamic variables on every voice session:

| Variable | Value |
|---|---|
| `is_resumed` | `"true"` or `"false"` |
| `resume_context` | The earlier conversation as plain text, `Client:` and `Athena:` lines, capped at 6000 characters. Empty string when there is nothing to resume |

The agent ignores them until its prompt references them. **Add this to the
agent's system prompt in the ElevenLabs dashboard**, after the opening sequence
section:

```
## Resumed sessions (overrides the opening sequence above)

is_resumed: {{is_resumed}}

If is_resumed is false, ignore this whole section and follow the opening sequence normally.

If is_resumed is true, {{client_first_name}} already started this session earlier and has come back to finish it. Everything below happened already and every answer in it is saved:

{{resume_context}}

In that case:
1. Do not run the audio check. Do not send the greeting. The opening sequence has already happened.
2. Your first spoken line is one short warm sentence welcoming {{client_first_name}} back and saying you will pick up where you left off, followed straight away by the next question you still need.
3. Never ask again about anything answered above. Read it first and work out which of the ten areas are already covered.
4. Continue from the first area still uncovered, in the usual order, until all ten are done.
5. If all ten areas are already covered above, thank them, close with the completion sentence, and call submit_fact_find using the answers from that history.
```

Both variables must also be declared on the agent, with defaults (`"false"` and
an empty string), or a first-time client's connection will fail on an undefined
variable.

The equivalent instruction for the text session already lives in this repo, as
`RESUME_CLAUSE` in `app/api/athena/route.ts`. Keep the two in step: they are the
same behaviour written for two different runtimes.

## Testing it

1. Open an onboarding link and answer a few questions.
2. Close the tab.
3. Reopen the same link. The intro reads **Welcome Back** and names how many
   answers were saved.
4. Press continue. Athena welcomes the client back and asks the next uncovered
   question, not the first one.

Check the adviser side at `/clients/<id>` and `/clients/<id>/fact-find-review`:
the session shows as resumed once, with every turn from both visits.
