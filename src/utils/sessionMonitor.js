/**
 * 🚀 SessionMonitor.js
 * 
 * Tracks critical performance metrics during app lifecycle:
 * - Hydration timing (loading from AsyncStorage)
 * - Background refresh duration (API fetch)
 * - API response times
 * - Session timeout warnings
 */

class SessionMonitor {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            hydration: {
                startTime: null,
                endTime: null,
                duration: null,
                userId: null
            },
            backgroundRefresh: {
                startTime: null,
                endTime: null,
                duration: null,
                success: false,
                error: null
            },
            apiCalls: [],
        };

        this.config = {
            HYDRATION_THRESHOLD_MS: 500,
            REFRESH_THRESHOLD_MS: 3000,
            API_THRESHOLD_MS: 2000,
            ENABLE_CONSOLE_LOG: true,
            ENABLE_SENTRY: false,
        };
    }

    configure(options) {
        this.config = { ...this.config, ...options };
    }

    startHydration() {
        this.metrics.hydration.startTime = Date.now();
        if (this.config.ENABLE_CONSOLE_LOG) {
            console.log('🟢 [SessionMonitor] Hydration started');
        }
    }

    endHydration(userId) {
        const now = Date.now();
        this.metrics.hydration.endTime = now;
        this.metrics.hydration.duration = now - this.metrics.hydration.startTime;
        this.metrics.hydration.userId = userId;

        if (this.config.ENABLE_CONSOLE_LOG) {
            console.log(`✅ [SessionMonitor] Hydration completed in ${this.metrics.hydration.duration}ms`);
        }

        if (this.metrics.hydration.duration > this.config.HYDRATION_THRESHOLD_MS) {
            this._warn(`Hydration took ${this.metrics.hydration.duration}ms (slow!)`);
        }
    }

    startBackgroundRefresh(userId) {
        this.metrics.backgroundRefresh.startTime = Date.now();
        if (this.config.ENABLE_CONSOLE_LOG) {
            console.log(`🔵 [SessionMonitor] Background refresh started (${userId})`);
        }
    }

    endBackgroundRefresh(success, error = null) {
        const now = Date.now();
        this.metrics.backgroundRefresh.endTime = now;
        this.metrics.backgroundRefresh.duration = now - this.metrics.backgroundRefresh.startTime;
        this.metrics.backgroundRefresh.success = success;
        this.metrics.backgroundRefresh.error = error;

        if (this.config.ENABLE_CONSOLE_LOG) {
            if (success) {
                console.log(`✅ [SessionMonitor] Background refresh completed in ${this.metrics.backgroundRefresh.duration}ms`);
            } else {
                console.warn(`❌ [SessionMonitor] Background refresh failed in ${this.metrics.backgroundRefresh.duration}ms`, error);
            }
        }

        if (this.metrics.backgroundRefresh.duration > this.config.REFRESH_THRESHOLD_MS) {
            this._warn(`Background refresh took ${this.metrics.backgroundRefresh.duration}ms (slow!)`);
        }
    }

    startAPICall(endpoint) {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = Date.now();
        this.metrics.apiCalls.push({
            id,
            endpoint,
            startTime: timestamp,
            endTime: null,
            duration: null,
            success: null,
            error: null
        });
        return id;
    }

    endAPICall(id, success, error = null) {
        const callIndex = this.metrics.apiCalls.findIndex(c => c.id === id);
        if (callIndex !== -1) {
            const now = Date.now();
            const call = this.metrics.apiCalls[callIndex];
            call.endTime = now;
            call.duration = now - call.startTime;
            call.success = success;
            call.error = error;

            if (call.duration > this.config.API_THRESHOLD_MS) {
                this._warn(`API Call to ${call.endpoint} took ${call.duration}ms (slow!)`);
            }
        }
    }

    _warn(message) {
        console.warn(`⚠️ [SessionMonitor] ${message}`);
        // Future: Sentry integration here
        if (this.config.ENABLE_SENTRY) {
            // Sentry.captureMessage(message);
        }
    }

    printSummary() {
        const uptime = Date.now() - this.metrics.startTime;
        const apiCalls = this.metrics.apiCalls.filter(c => c.endTime !== null);
        const avgApiDuration = apiCalls.length > 0
            ? (apiCalls.reduce((acc, c) => acc + c.duration, 0) / apiCalls.length).toFixed(0)
            : 0;

        // Simulating user-requested summary format
        const summary = {
            totalSessions: 1, // Current session
            sessionUptime: `${(uptime / 1000).toFixed(1)}s`,
            hydration: {
                count: 1,
                avgDuration: `${this.metrics.hydration.duration}ms`,
                maxDuration: `${this.metrics.hydration.duration}ms`,
                slowCount: this.metrics.hydration.duration > this.config.HYDRATION_THRESHOLD_MS ? 1 : 0
            },
            backgroundRefresh: {
                count: this.metrics.backgroundRefresh.endTime ? 1 : 0,
                avgDuration: `${this.metrics.backgroundRefresh.duration}ms`,
                maxDuration: `${this.metrics.backgroundRefresh.duration}ms`,
                successRate: this.metrics.backgroundRefresh.success ? "1/1" : "0/1",
                slowCount: this.metrics.backgroundRefresh.duration > this.config.REFRESH_THRESHOLD_MS ? 1 : 0
            },
            apiCalls: {
                count: apiCalls.length,
                avgDuration: `${avgApiDuration}ms`,
                maxDuration: `${Math.max(...apiCalls.map(c => c.duration), 0)}ms`,
                successRate: `${apiCalls.filter(c => c.success).length}/${apiCalls.length}`,
                slowCount: apiCalls.filter(c => c.duration > this.config.API_THRESHOLD_MS).length
            },
            platform: "react-native"
        };

        console.log('\n' + '='.repeat(88));
        console.log('📊 [SessionMonitor] Performance Summary');
        console.log('='.repeat(88));
        console.log(JSON.stringify(summary, null, 2));
        console.log('='.repeat(88) + '\n');
    }
}

export const sessionMonitor = new SessionMonitor();
