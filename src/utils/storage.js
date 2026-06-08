export const storage = {
  getAdminToken() {
    return localStorage.getItem('admin_token');
  },
  setAdminSession(token, user) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user || {}));
  },
  clearAdminSession() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  getAdminUser() {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || 'null');
    } catch {
      return null;
    }
  },
  getDistributorToken() {
    return localStorage.getItem('distributor_token');
  },
  setDistributorSession(token, user) {
    localStorage.setItem('distributor_token', token);
    localStorage.setItem('distributor_user', JSON.stringify(user || {}));
  },
  clearDistributorSession() {
    localStorage.removeItem('distributor_token');
    localStorage.removeItem('distributor_user');
  },
  getDistributorUser() {
    try {
      return JSON.parse(localStorage.getItem('distributor_user') || 'null');
    } catch {
      return null;
    }
  },
};
