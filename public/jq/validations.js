export function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}

export function validateName(name) {
    const re = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
    return re.test(String(name)) && name.length >= 2 && name.length <= 50;
}

export function validateLocation(location) {
    const re = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:(?:[ '.-]|, ?)[A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*$/;
    return re.test(String(location)) && location.length >= 2 && location.length <= 100;
}

export function validateDomainName(domainName) {
    const re = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.(?:[A-Za-z]{2,})$/;
    return re.test(String(domainName).toLowerCase());
}