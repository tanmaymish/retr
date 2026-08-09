import { IOSDevice } from './frames/IOSFrame';
import { AndroidDevice } from './frames/AndroidFrame';
import DvCard from './DvCard';

// Renders one screen panel (a phone frame or a wide card) from the extracted
// wireframe markup. The markup is our own static, pre-authored content (not
// user input), so dangerouslySetInnerHTML is safe here.
export default function Panel({ panel }) {
  if (panel.type === 'ios') {
    return (
      <IOSDevice title={panel.title}>
        <div dangerouslySetInnerHTML={{ __html: panel.html }} />
      </IOSDevice>
    );
  }
  if (panel.type === 'android') {
    return (
      <AndroidDevice title={panel.title} large={panel.large}>
        <div dangerouslySetInnerHTML={{ __html: panel.html }} />
      </AndroidDevice>
    );
  }
  return (
    <DvCard width={panel.width}>
      <div dangerouslySetInnerHTML={{ __html: panel.html }} />
    </DvCard>
  );
}
