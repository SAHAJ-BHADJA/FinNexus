import HeaderBox from '@/components/HeaderBox';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;

  // Try to get the logged-in user
  let loggedIn;
  try {
    loggedIn = await getLoggedInUser();
    if (!loggedIn) {
      console.error('User not logged in.');
      return (
        <section className="home">
          <div className="home-content">
            <p>Please log in to access your account.</p>
          </div>
        </section>
      );
    }
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    return (
      <section className="home">
        <div className="home-content">
          <p>Failed to load user data. Please try again later.</p>
        </div>
      </section>
    );
  }

  // Fetch user accounts
  let accounts;
  try {
    accounts = await getAccounts({ userId: loggedIn.$id });
    if (!accounts || !accounts.data || accounts.data.length === 0) {
      console.error('No accounts found for user:', loggedIn.$id);
      return (
        <section className="home">
          <div className="home-content">
            <p>No accounts available for this user.</p>
          </div>
        </section>
      );
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return (
      <section className="home">
        <div className="home-content">
          <p>Failed to load account data. Please try again later.</p>
        </div>
      </section>
    );
  }

  const accountsData = accounts?.data;
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  // Fetch account data
  let account;
  try {
    account = await getAccount({ appwriteItemId });
    if (!account) {
      console.error('Account not found:', appwriteItemId);
      return (
        <section className="home">
          <div className="home-content">
            <p>Account details could not be loaded.</p>
          </div>
        </section>
      );
    }
  } catch (error) {
    console.error('Error fetching account data:', error);
    return (
      <section className="home">
        <div className="home-content">
          <p>Failed to load account transactions. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>

        <RecentTransactions
          accounts={accountsData}
          transactions={account?.transactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={account?.transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
