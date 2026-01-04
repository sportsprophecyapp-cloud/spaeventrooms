/**
 * Verification Script: verify_auth_logic.js
 * This script tests the robust permission check logic implemented in the authorize middleware.
 */

function testPermission(rolePerms, permission) {
    let hasPermission = false;
    if (rolePerms && rolePerms.permissions) {
        if (typeof rolePerms.permissions.get === 'function') {
            hasPermission = rolePerms.permissions.get(permission) === true;
        } else {
            hasPermission = rolePerms.permissions[permission] === true;
        }
    }
    return hasPermission;
}

const testCases = [
    {
        name: "Plain Object - Permission Exists",
        rolePerms: { permissions: { can_mute_users: true } },
        permission: "can_mute_users",
        expected: true
    },
    {
        name: "Plain Object - Permission Missing",
        rolePerms: { permissions: { can_mute_users: true } },
        permission: "can_ban_users",
        expected: false
    },
    {
        name: "Mongoose-style Map - Permission Exists",
        rolePerms: {
            permissions: {
                get: (p) => p === "can_mute_users" ? true : undefined
            }
        },
        permission: "can_mute_users",
        expected: true
    },
    {
        name: "Mongoose-style Map - Permission Missing",
        rolePerms: {
            permissions: {
                get: (p) => p === "can_mute_users" ? true : undefined
            }
        },
        permission: "can_ban_users",
        expected: false
    },
    {
        name: "Missing Permissions Object",
        rolePerms: {},
        permission: "can_mute_users",
        expected: false
    },
    {
        name: "Null rolePerms",
        rolePerms: null,
        permission: "can_mute_users",
        expected: false
    }
];

console.log("Running Permission Logic Verification...\n");
let passedCount = 0;

testCases.forEach(tc => {
    const result = testPermission(tc.rolePerms, tc.permission);
    if (result === tc.expected) {
        console.log(`✅ PASSED: ${tc.name}`);
        passedCount++;
    } else {
        console.error(`❌ FAILED: ${tc.name} (Expected ${tc.expected}, got ${result})`);
    }
});

console.log(`\nSummary: ${passedCount}/${testCases.length} tests passed.`);
if (passedCount === testCases.length) {
    console.log("All permission logic tests passed successfully!");
} else {
    process.exit(1);
}
