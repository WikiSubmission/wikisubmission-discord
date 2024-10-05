# wikisubmission-discord

Official repository for all WikiSubmission Discord Services.

To run locally, use `npm run start`. A .env file is required with `SUPABASE_URL` and `SUPABASE_API_KEY` defined. In production, `NODE_ENV` should be set to `production`.

You can use CLI arguments to customize the launch strategy:

- `public` or `private` followed by `npm run start` will only run either one of the bots (public is the global bot accessible to everyone, private is reserved for SS).
- `no-command-sync` or `ncs` followed by `npm run start` will not re-sync commands from local to Discord's API (avoid rate limits when frequently restarting).

Note: the order of arguments do not matter. No dashes or prefixes necassary. Default behaviour when running `npm run start`: launch both bots and always resync commands on start (TODO: automate this by diff checking command objects).

**Under Development.**
