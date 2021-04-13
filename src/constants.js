// Gets users home dir to store config files
export const CONFIG_PATH = process.env.APPDATA
  ? `${process.env.APPDATA}\\ldpos-wallet\\`
  : process.platform == 'darwin'
  ? process.env.HOME + '/Library/Preferences/ldpos-wallet/'
  : process.env.HOME + '/.local/share/ldpos-wallet/';

export const CONFIG_FILE_PATH = `${CONFIG_PATH}config.json`;
