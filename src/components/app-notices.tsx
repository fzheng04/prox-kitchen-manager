import { BellRing, CloudOff, TriangleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { useApp } from '@/state/app-state';

import { Notice } from './ui/bits';
import { Button } from './ui/tile';

/** Persistence problems and the simulated restock reminder, shown at the top of tab screens. */
export function AppNotices({ showReminder = true }: { showReminder?: boolean }) {
  const { loadError, saveError, retrySave, state, dispatch } = useApp();
  if (!loadError && !saveError && !(showReminder && state.reminder)) return null;
  return (
    <View style={{ gap: 8 }}>
      {loadError ? (
        <Notice tone="error" icon={TriangleAlert} title="Started from sample data" body={loadError} />
      ) : null}
      {saveError ? (
        <Notice
          tone="error"
          icon={CloudOff}
          title="Changes aren't saved yet"
          body={saveError}
          action={<Button label="Retry" size="sm" variant="secondary" onPress={retrySave} />}
        />
      ) : null}
      {showReminder && state.reminder ? (
        <Notice
          icon={BellRing}
          title="Restock reminder (simulated)"
          body={state.reminder.text}
          action={<Button label="Dismiss" size="sm" variant="ghost" onPress={() => dispatch({ type: 'DISMISS_REMINDER' })} />}
        />
      ) : null}
    </View>
  );
}
