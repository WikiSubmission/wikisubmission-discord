export type DiscordScheduledAction = {
  id: string;
  description: string;
  interval:
    | 'EVERY_MINUTE'
    | 'EVERY_HOUR'
    | 'EVERY_DAY'
    | 'EVERY_OTHER_DAY'
    | 'EVERY_WEEK';
  action: () => Promise<void>;
};
