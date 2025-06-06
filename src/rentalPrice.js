const minLicenceYears = 1;

function price({
  pickUp,
  dropOff,
  pickUpDate,
  dropOffDate,
  carType,
  age,
  licenceIssueDate,
}) {
  const carClass = getCarClass(carType);
  const days = getDays(pickUpDate, dropOffDate);
  const season = getSeason(pickUpDate, dropOffDate);
  const licenceYearsHeld = getLicenceYearsHeld(licenceIssueDate);

  const isElegibleMessage = isDriverElegible({
    age,
    carClass,
    licenceYearsHeld,
  });

  if (isElegibleMessage !== true) {
    return isElegibleMessage;
  }

  let rentalPrice = getBasePrice(age, pickUpDate, dropOffDate);

  rentalPrice = applyPriceModifiers(rentalPrice, {
    carClass,
    days,
    season,
    age,
    licenceYearsHeld,
  });

  return "$" + rentalPrice.toFixed(2);
}

function isDriverElegible({ age, carClass, licenceYearsHeld }) {
  if (age < 18) {
    return "Driver too young - cannot quote the price";
  }

  if (licenceYearsHeld < minLicenceYears) {
    return "Driver has not held the licence long enough";
  }

  if (age <= 21 && carClass !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  return true;
}

function applyPriceModifiers(price, { carClass, age, season, days, licenceYearsHeld }) {
  if (carClass === "Racer" && age <= 25 && season === "High") {
    price *= 1.5;
  }

  if (licenceYearsHeld < 2) {
    price *= 1.3;
  }

  if (season === "High") {
    price *= 1.15;
  }

  if (licenceYearsHeld < 3 && season === "High") {
    price += 15;
  }

  if (days > 10 && season === "Low") {
    price *= 0.9;
  }

  return Number(price.toFixed(2));
}

function getLicenceYearsHeld(licenceIssueDate) {
  const millisecondsInYear = 24 * 60 * 60 * 1000 * 365.5;

  const issueDate = new Date(licenceIssueDate);
  const currentDate = new Date();

  const yearsHeld = Math.round((currentDate - issueDate) / millisecondsInYear);

  return yearsHeld;
}

function getCarClass(carType) {
  const carTypes = ["Compact", "Electric", "Cabrio", "Racer"];
  if (carTypes.includes(carType)) {
    return carType;
  }

  return "Unknown Car Type";
}

function getDays(pickUpDate, dropOffDate) {
  const millisecondsInADay = 24 * 60 * 60 * 1000;

  const firstDate = new Date(pickUpDate);
  const secondDate = new Date(dropOffDate);

  const differenceInMilliseconds = Math.abs(firstDate - secondDate);

  return Math.ceil(differenceInMilliseconds / millisecondsInADay);
}

function getSeason(pickUpDate, dropOffDate) {
  const highSeasonStartMonth = 3; // April, months are zero-based
  const highSeasonEndMonth = 9; // October

  const pickUpMonth = new Date(pickUpDate).getMonth();
  const dropOffMonth = new Date(dropOffDate).getMonth();

  const isHighSeason =
    (pickUpMonth >= highSeasonStartMonth &&
      pickUpMonth <= highSeasonEndMonth) ||
    (dropOffMonth >= highSeasonStartMonth &&
      dropOffMonth <= highSeasonEndMonth) ||
    (pickUpMonth < highSeasonStartMonth && dropOffMonth > highSeasonEndMonth);

  return isHighSeason ? "High" : "Low";
}

function getBasePrice(age, startDate, endDate) {
  let price = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while(current <= end) {
    const day = current.getDay();
    if(day === 0 || day === 6) {
      price += age * 1.05;
    }
    else {
      price += age;
    }

    current.setDate(current.getDate() + 1);
  }

  return price;
}

module.exports = {
  price,
  isDriverElegible,
  getCarClass,
  getLicenceYearsHeld,
  getDays,
  getSeason,
  applyPriceModifiers,
  getBasePrice
};