import { connect } from "@kheopskit/core";
import { useWallets } from "@kheopskit/react";
import "./App.css";
import { Fragment, useCallback } from "react";

function App() {
  const handleClick = useCallback(() => {
    connect();
  }, []);

  return (
    <>
      <div className="connect-buttons">
        <button type="button" onClick={handleClick}>
          Connect Polkadot
        </button>
        <button type="button" onClick={handleClick}>
          Connect Ethereum
        </button>
        <button type="button" onClick={handleClick}>
          Connect Polkadot or Ethereum
        </button>
      </div>
      <InjectedPolkadotWallets />
    </>
  );
}

const InjectedPolkadotWallets = () => {
  const {
    injectedExtensionIds,
    connectedExtensions,
    accounts,
    connect,
    disconnect,
  } = useWallets();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
      {injectedExtensionIds.map((id) => (
        <Fragment key={id}>
          <div>{id}</div>
          <div>
            {connectedExtensions.some((e) => e.name === id)
              ? accounts.filter((a) => a.wallet === id).length
              : "N/A"}
          </div>
          <div>
            {connectedExtensions.some((e) => e.name === id) ? (
              <button type="button" onClick={() => disconnect(id)}>
                disconnect
              </button>
            ) : (
              <button type="button" onClick={() => connect(id)}>
                connect
              </button>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default App;
