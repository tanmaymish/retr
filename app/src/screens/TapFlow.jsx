import { IOSDevice } from '../components/frames/IOSFrame';
import ProtectionFlow from '../components/ProtectionFlow';

// Screen 4a in the design gallery — the same ProtectionFlow state machine
// used inside the real app's Home tab, shown here standalone in its own frame.
export default function TapFlow() {
  return (
    <IOSDevice title="Akshayvridhi">
      <ProtectionFlow />
    </IOSDevice>
  );
}
