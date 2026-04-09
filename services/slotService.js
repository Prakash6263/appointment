const BlockTime = require("../models/BlockTime");
const Booking = require("../models/Booking");
const ProviderAvailability = require("../models/ProviderAvailability");

const checkSlotAvailability = async ({
  providerId,
  bookingDate,
  startTime,
  endTime,
}) => {
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (end <= start) {
    return { available: false, message: "End time must be after start time" };
  }

  // Normalize date
  const selectedDate = new Date(bookingDate);
  selectedDate.setHours(0, 0, 0, 0);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // ✅ 1. Check availability
  const availability = await ProviderAvailability.findOne({ providerId });

  const dayName = selectedDate.toLocaleString("en-US", {
    weekday: "long",
  });

  const daySchedule = availability?.weeklySchedule.find(
    (d) => d.day === dayName
  );

  if (!daySchedule || !daySchedule.enabled) {
    return { available: false, message: "Provider not available on this day" };
  }

  const availStart = toMinutes(daySchedule.start);
  const availEnd = toMinutes(daySchedule.end);

  if (start < availStart || end > availEnd) {
    return {
      available: false,
      message: "Selected time is outside working hours",
    };
  }

  // ✅ 2. Check block time
  const blocks = await BlockTime.find({
    providerId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: "active",
  });

  for (const block of blocks) {
    const bStart = toMinutes(block.startTime);
    const bEnd = toMinutes(block.endTime);

    if (start < bEnd && end > bStart) {
      return { available: false, message: "Slot is blocked" };
    }
  }

  // ✅ 3. Check bookings
  const bookings = await Booking.find({
    providerId,
    bookingDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: "CANCELLED" },
  });

  for (const booking of bookings) {
    const bStart = toMinutes(booking.startTime);
    const bEnd = toMinutes(booking.endTime);

    if (start < bEnd && end > bStart) {
      return { available: false, message: "Slot already booked" };
    }
  }

  return { available: true };
};

module.exports = { checkSlotAvailability };