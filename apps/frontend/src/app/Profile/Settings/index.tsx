import { Box, Flex, Select, Theme, useTheme } from "@repo/theme";

import styles from "../Account/Account.module.scss";

const themeOptions = [
  { value: null, label: "System Default" },
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h1>Settings</h1>
      <h2>Appearance</h2>
      <div>
        <Flex
          justify="between"
          direction="row"
          width="80%"
          className={styles.infoItem}
        >
          <label>Theme</label>
          <Box width="200px">
            <Select
              options={themeOptions}
              value={theme}
              onChange={(newValue) => setTheme(newValue as Theme)}
            />
          </Box>
        </Flex>
      </div>
    </div>
  );
}
