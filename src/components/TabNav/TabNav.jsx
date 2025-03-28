import styles from "./TabNav.module.css";

function TabNav({ activeTab, onTabChange, tabs }) {
  return (
    <nav className={styles.container}>
      <ul className={styles.tabList}>
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={tab.id === activeTab ? styles.activeTab : styles.tab}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TabNav;
