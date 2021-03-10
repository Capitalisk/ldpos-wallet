import ldposClient from 'ldpos-client';

let client = { network: null, walletConnected: false, connected: false };

export const connect = async (config) => {
  client.network = ldposClient.createClient(config);

  await client.network.connect();

  client.connected = true;

  return client;
};

export const authenticate = async (passphrase) => {
  try {
    client.walletConnected = false;
    client.connected = false;

    await client.network.connect({ passphrase });

    client.walletConnected = true;
    client.connected = true;

    setTimeout(async () => {
      await deauthenticate();
    }, 15 * 60 * 60);

    return client;
  } catch (e) {
    client.walletConnected = false;
    client.connected = false;

    console.error(e);
    return e;
  }
};

export const useClient = () => {
  return client;
};

export const deauthenticate = async () => {
  await client.network.disconnect();

  client.connected = false;
  client.walletConnected = false;

  return client
};
