

exports.extractCookies = (res) => {
    const re = new RegExp('; path=/; httponly', 'gi');
    return res.headers['set-cookie'].map(r => r.replace(re, '')).join('; ');
};
