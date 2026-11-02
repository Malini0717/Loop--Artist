<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Keep the loop game's scoring and round-summary numbers as pure helpers in `src/lib/loop-game.ts` covered by `src/lib/loop-game.test.ts`, so the rules the score card prints stay checkable instead of living inside the component.
