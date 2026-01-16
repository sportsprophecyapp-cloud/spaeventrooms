const isMatchWindow = (mockDate: Date): boolean => {
    const day = mockDate.getDay(); // 0 = Sun, 6 = Sat
    const hour = mockDate.getHours(); // 0-23

    console.log(`Checking Time: ${mockDate.toDateString()} ${hour}:00 (Day: ${day}, Hour: ${hour})`);

    // Weekends (Sat/Sun): Active 12 PM - 11 PM
    const isWeekend = day === 0 || day === 6;
    if (isWeekend && hour >= 12 && hour <= 23) {
        console.log('  => ✅ Active (Weekend Window)');
        return true;
    }

    // Weekdays: Active 6 PM - 11 PM (Champions League/Mid-week games)
    if (!isWeekend && hour >= 18 && hour <= 23) {
        console.log('  => ✅ Active (Weekday Window)');
        return true;
    }

    console.log('  => 💤 Inactive (Or Off-Peak)');
    return false;
};

// Test Use Cases
console.log('🧪 Testing Smart Scheduler Logic...\n');

// 1. Saturday 2 PM (Should be Active)
isMatchWindow(new Date('2026-06-13T14:00:00'));

// 2. Saturday 9 AM (Should be Inactive)
isMatchWindow(new Date('2026-06-13T09:00:00'));

// 3. Wednesday 8 PM (Should be Active)
isMatchWindow(new Date('2026-06-17T20:00:00'));

// 4. Wednesday 2 PM (Should be Inactive)
isMatchWindow(new Date('2026-06-17T14:00:00'));

// 5. Sunday 11 PM (Should be Active - Last Hour)
isMatchWindow(new Date('2026-06-14T23:59:00'));

console.log('\n✅ Test Complete');
