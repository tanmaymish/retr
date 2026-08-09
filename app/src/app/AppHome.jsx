import ProtectionFlow from '../components/ProtectionFlow';

// The Home tab *is* the decision-engine flow (originally screen 4a/3a): a
// resilience summary and a next-best-action card that opens into
// why -> options -> decided when tapped.
export default function AppHome() {
  return <ProtectionFlow />;
}
