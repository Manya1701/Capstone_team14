/**
 * Known port risk database
 * Maps port numbers to service info and risk levels
 */
const PORT_RISK_DB = {
  20: { service: "FTP Data", risk: "high", reason: "FTP transmits data in plaintext" },
  21: { service: "FTP Control", risk: "high", reason: "FTP is unencrypted, vulnerable to sniffing" },
  22: { service: "SSH", risk: "medium", reason: "Secure but brute-force target if exposed" },
  23: { service: "Telnet", risk: "critical", reason: "Completely unencrypted remote access" },
  25: { service: "SMTP", risk: "medium", reason: "Can be abused for spam relay" },
  53: { service: "DNS", risk: "medium", reason: "DNS amplification attacks possible" },
  67: { service: "DHCP", risk: "medium", reason: "DHCP spoofing possible" },
  68: { service: "DHCP Client", risk: "low", reason: "Usually safe on internal networks" },
  69: { service: "TFTP", risk: "high", reason: "No authentication, easily exploited" },
  80: { service: "HTTP", risk: "medium", reason: "Unencrypted web traffic" },
  110: { service: "POP3", risk: "high", reason: "Unencrypted email retrieval" },
  111: { service: "RPC", risk: "high", reason: "Remote procedure call, common attack vector" },
  119: { service: "NNTP", risk: "medium", reason: "Network news, rarely needed" },
  135: { service: "MS-RPC", risk: "high", reason: "Common Windows exploit target" },
  137: { service: "NetBIOS", risk: "high", reason: "Legacy Windows, information disclosure" },
  138: { service: "NetBIOS", risk: "high", reason: "Legacy Windows, information disclosure" },
  139: { service: "NetBIOS SSN", risk: "high", reason: "SMB over NetBIOS, ransomware target" },
  143: { service: "IMAP", risk: "medium", reason: "Email access, often unencrypted" },
  161: { service: "SNMP", risk: "high", reason: "Network management, often misconfigured" },
  162: { service: "SNMP Trap", risk: "high", reason: "SNMP traps, information leakage" },
  389: { service: "LDAP", risk: "medium", reason: "Directory service, can leak user data" },
  443: { service: "HTTPS", risk: "low", reason: "Encrypted web traffic, generally safe" },
  445: { service: "SMB", risk: "critical", reason: "EternalBlue, WannaCry target — very dangerous" },
  500: { service: "IKE/IPSec", risk: "medium", reason: "VPN, potential misconfiguration" },
  512: { service: "rexec", risk: "critical", reason: "Unencrypted remote execution" },
  513: { service: "rlogin", risk: "critical", reason: "Obsolete remote login, no auth" },
  514: { service: "rsh/syslog", risk: "high", reason: "Remote shell without authentication" },
  515: { service: "LPD/LPR", risk: "medium", reason: "Legacy printer service" },
  587: { service: "SMTP Submission", risk: "low", reason: "Mail submission, generally acceptable" },
  631: { service: "IPP", risk: "medium", reason: "Internet printing, sometimes exploited" },
  993: { service: "IMAPS", risk: "low", reason: "Encrypted IMAP, generally safe" },
  995: { service: "POP3S", risk: "low", reason: "Encrypted POP3, generally safe" },
  1080: { service: "SOCKS Proxy", risk: "high", reason: "Proxy service, often abused" },
  1433: { service: "MS-SQL", risk: "high", reason: "Database exposed to network, dangerous" },
  1521: { service: "Oracle DB", risk: "high", reason: "Oracle database, should not be public" },
  2049: { service: "NFS", risk: "high", reason: "Network file system, data exposure risk" },
  3000: { service: "Dev Server", risk: "medium", reason: "Development server, should not be in production" },
  3306: { service: "MySQL", risk: "high", reason: "Database port, should never be public" },
  3389: { service: "RDP", risk: "critical", reason: "Remote Desktop, primary ransomware target" },
  4444: { service: "Metasploit", risk: "critical", reason: "Common malware/backdoor port" },
  5432: { service: "PostgreSQL", risk: "high", reason: "Database should not be network-exposed" },
  5900: { service: "VNC", risk: "critical", reason: "Remote desktop, often poorly secured" },
  6379: { service: "Redis", risk: "critical", reason: "Often no auth, full data access" },
  8080: { service: "HTTP Alt", risk: "medium", reason: "Alternative HTTP, check for misconfig" },
  8443: { service: "HTTPS Alt", risk: "low", reason: "Alternative HTTPS, generally acceptable" },
  9200: { service: "Elasticsearch", risk: "critical", reason: "No auth by default, data exposure" },
  27017: { service: "MongoDB", risk: "critical", reason: "No auth by default, full DB access" },
};

/**
 * Get risk info for a port
 * @param {number} port
 * @returns {{ service: string, risk: string, reason: string }}
 */
function getPortRiskInfo(port) {
  return (
    PORT_RISK_DB[port] || {
      service: "unknown",
      risk: "low",
      reason: "No known vulnerabilities for this port",
    }
  );
}

/**
 * Check if a port is considered high risk
 */
function isHighRisk(port) {
  const info = getPortRiskInfo(port);
  return info.risk === "high" || info.risk === "critical";
}

module.exports = { PORT_RISK_DB, getPortRiskInfo, isHighRisk };
