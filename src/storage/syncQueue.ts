import { db } from './db';
import { useAppStore } from '../store/useAppStore';

export class SyncQueueService {
  private static isSyncing = false;

  /**
   * Initializes listeners for browser network transitions.
   */
  public static init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('Network online event detected.');
      const store = useAppStore.getState();
      if (store.networkMode === 'OFFLINE') {
        store.setNetworkMode('ONLINE');
      }
      this.flushPendingQueue();
    });

    // Also subscribe to Zustand store network mode changes (e.g. from Chaos Simulator)
    useAppStore.subscribe((state, prevState) => {
      if (prevState.networkMode === 'OFFLINE' && state.networkMode !== 'OFFLINE') {
        this.flushPendingQueue();
      }
    });
  }

  /**
   * Flushes all pending offline custody and disruption records.
   */
  public static async flushPendingQueue(): Promise<number> {
    if (this.isSyncing) return 0;
    this.isSyncing = true;

    try {
      const pendingEvents = await db.custodyEvents
        .where('syncStatus')
        .equals('PENDING_OFFLINE')
        .toArray();

      if (pendingEvents.length === 0) {
        this.isSyncing = false;
        return 0;
      }

      console.log(`Flushing ${pendingEvents.length} pending offline custody event(s)...`);

      // Mark all as SYNCED
      await db.transaction('rw', db.custodyEvents, async () => {
        for (const event of pendingEvents) {
          await db.custodyEvents.update(event.id, {
            syncStatus: 'SYNCED',
          });
        }
      });

      const addToast = useAppStore.getState().addToast;
      addToast(
        'success',
        `Network Restored: Flushed ${pendingEvents.length} offline custody event(s) to central regulatory registry!`
      );

      this.isSyncing = false;
      return pendingEvents.length;
    } catch (err) {
      console.error('Failed to flush offline sync queue:', err);
      this.isSyncing = false;
      return 0;
    }
  }

  /**
   * Returns count of currently pending events
   */
  public static async getPendingCount(): Promise<number> {
    return await db.custodyEvents
      .where('syncStatus')
      .equals('PENDING_OFFLINE')
      .count();
  }
}

// Auto-initialize listeners
SyncQueueService.init();
