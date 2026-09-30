import { RoleGate } from '../src/features/auth/components/RoleGate/RoleGate';
import { ReportScreen } from '../src/features/report/screens/ReportScreen';

// Outside the role groups: customers and shops both report problems.
export default function ReportRoute() {
  return (
    <RoleGate allow="signedIn">
      <ReportScreen />
    </RoleGate>
  );
}
