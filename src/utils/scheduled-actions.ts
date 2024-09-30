import { DiscordScheduledAction } from '../types/WScheduledAction';

export class DiscordScheduledActions {
  public static actions: Map<
    string,
    { intervalId: NodeJS.Timeout; action: DiscordScheduledAction }
  > = new Map();

  static create(action: DiscordScheduledAction) {
    const { id: name, interval, action: actionFunction } = action;

    let intervalMs: number;
    switch (interval) {
      case 'EVERY_MINUTE':
        intervalMs = 60 * 1000;
        break;
      case 'EVERY_HOUR':
        intervalMs = 60 * 60 * 1000;
        break;
      case 'EVERY_DAY':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      case 'EVERY_OTHER_DAY':
        intervalMs = 48 * 60 * 60 * 1000;
        break;
      case 'EVERY_WEEK':
        intervalMs = 168 * 60 * 60 * 1000;
        break;
    }

    const intervalId = setInterval(async () => {
      try {
        await actionFunction();
      } catch (error) {}
    }, intervalMs);

    this.actions.set(name, { intervalId, action });

    return this;
  }

  static stop(name: string) {
    const actionInfo = this.actions.get(name);
    if (actionInfo) {
      clearInterval(actionInfo.intervalId);
      this.actions.delete(name);
    } else {
    }
  }

  static async trigger(name: string): Promise<void | Error> {
    const actionInfo = this.actions.get(name);
    if (actionInfo) {
      await actionInfo.action.action();
    } else {
      return new Error(
        `Could not find a scheduled action with ID of "${name}". Possible actions are: ${this.listActiveActions().join(
          ', ',
        )}`,
      );
    }
  }

  static listActiveActions(): string[] {
    return Array.from(this.actions.keys());
  }
}
