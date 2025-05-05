import { useCallback, useEffect } from "react";
import { bind } from "@react-rxjs/core";
import { polkadot } from "@kheopskit/core";

const [useInjectedExtensionsIds] = bind(polkadot.injectedExtensionIds$);
const [useConnectedExtensions] = bind(polkadot.connectedExtensions$);
const [useConnectedAccounts] = bind(polkadot.accounts$);

export const useWallets = () => {
  // const [, setConnectedExtensionIds] = useSetting("connectedExtensionIds");

  const injectedExtensionIds = useInjectedExtensionsIds();
  const connectedExtensions = useConnectedExtensions();
  const accounts = useConnectedAccounts();

  const connect = useCallback((name: string) => {
    polkadot.connectExtension(name);
    // setConnectedExtensionIds((prev) => [
    // 	...prev.filter((n) => n !== name),
    // 	name,
    // ]);
  }, []);

  const disconnect = useCallback((name: string) => {
    polkadot.disconnectExtension(name);
  }, []);

  useEffect(() => {
    console.log("[useWallets] injectedExtensionsIds", injectedExtensionIds);
  }, [injectedExtensionIds]);

  useEffect(() => {
    console.log("[useWallets] connectedExtensions", connectedExtensions);
  }, [connectedExtensions]);

  useEffect(() => {
    console.log("[useWallets] accounts", accounts);
  }, [accounts]);

  return {
    injectedExtensionIds,
    connectedExtensions,
    connect,
    disconnect,
    accounts,
  };
};
