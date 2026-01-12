#!/usr/bin/env node

/**
 * 🔍 findUnsafeUseMemo.js
 * 
 * Scans for unsafe useMemo hooks that call .map() on potentially undefined arrays.
 * This is the crash pattern causing your v2.18.13 errors.
 * 
 * Usage:
 *   node findUnsafeUseMemo.js ./src
 */

const fs = require('fs');
const path = require('path');

class UseMemoScanner {
    constructor() {
        this.results = [];
        this.issues = [];
    }

    scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const fileName = path.basename(filePath);

            let inUseMemo = false;
            let useMemoStart = -1;
            let braceCount = 0;
            let useMemoContent = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Detect useMemo start
                if (line.includes('useMemo(') || line.includes('useMemo (')) {
                    inUseMemo = true;
                    useMemoStart = i + 1;
                    braceCount = 0;
                    useMemoContent = line;
                }

                if (inUseMemo) {
                    // Track braces to find useMemo end
                    braceCount += (line.match(/\{/g) || []).length;
                    braceCount -= (line.match(/\}/g) || []).length;

                    useMemoContent += '\n' + line;

                    // Check for unsafe patterns
                    if (
                        line.includes('.map(') &&
                        !line.includes('Array.isArray') &&
                        !line.includes('if (') &&
                        !line.includes('try {')
                    ) {
                        this.issues.push({
                            file: filePath,
                            fileName,
                            line: i + 1,
                            type: 'unsafe_map_in_usememo',
                            content: line.trim(),
                            severity: 'HIGH',
                            message: 'useMemo contains .map() without Array.isArray() guard'
                        });
                    }

                    // Check for missing return array fallback
                    if (
                        line.includes('return') &&
                        !line.includes('[]') &&
                        !line.includes('return null') &&
                        inUseMemo
                    ) {
                        // Could be returning non-array
                    }

                    // End of useMemo
                    if (braceCount === 0 && useMemoStart !== i + 1) {
                        inUseMemo = false;

                        // Check entire useMemo block for patterns
                        if (
                            useMemoContent.includes('.map(') &&
                            useMemoContent.includes('.filter(')
                        ) {
                            if (
                                !useMemoContent.includes('Array.isArray') &&
                                !useMemoContent.includes('if (!') &&
                                !useMemoContent.includes('try {')
                            ) {
                                this.issues.push({
                                    file: filePath,
                                    fileName,
                                    startLine: useMemoStart,
                                    endLine: i + 1,
                                    type: 'unsafe_chain_in_usememo',
                                    severity: 'HIGH',
                                    message: 'useMemo has chained .map() and .filter() without guards'
                                });
                            }
                        }
                    }
                }
            }

            return this.issues.filter(issue => issue.file === filePath);
        } catch (error) {
            console.error(`Error scanning ${filePath}:`, error.message);
            return [];
        }
    }

    scanDirectory(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);

            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                const stat = fs.statSync(fullPath);

                // Skip node_modules, .next, etc.
                if (
                    fullPath.includes('node_modules') ||
                    fullPath.includes('.next') ||
                    fullPath.includes('.expo') ||
                    fullPath.includes('dist')
                ) {
                    return;
                }

                if (stat.isDirectory()) {
                    this.scanDirectory(fullPath);
                } else if (
                    file.endsWith('.js') ||
                    file.endsWith('.jsx') ||
                    file.endsWith('.ts') ||
                    file.endsWith('.tsx')
                ) {
                    this.scanFile(fullPath);
                }
            });
        } catch (error) {
            console.error(`Error scanning directory ${dirPath}:`, error.message);
        }
    }

    printResults() {
        if (this.issues.length === 0) {
            console.log('\n✅ No unsafe useMemo hooks found!\n');
            return [];
        }

        console.log('\n' + '='.repeat(80));
        console.log('🔍 UNSAFE useMemo SCANNER - RESULTS');
        console.log('='.repeat(80) + '\n');

        const byFile = {};
        this.issues.forEach(issue => {
            if (!byFile[issue.fileName]) {
                byFile[issue.fileName] = [];
            }
            byFile[issue.fileName].push(issue);
        });

        Object.entries(byFile).forEach(([fileName, issues]) => {
            console.log(`📄 ${fileName} (${issues.length} issue${issues.length > 1 ? 's' : ''})`);

            issues.forEach(issue => {
                console.log(`\n   Line ${issue.startLine || issue.line}: [${issue.severity}] ${issue.type}`);
                console.log(`   Message: ${issue.message}`);
                console.log(`   Code: ${issue.content}`);
                console.log(`\n   🛡️  FIX:`);
                console.log(`   Wrap the entire useMemo with: if (!Array.isArray(input)) return [];`);
            });
        });

        console.log('\n' + '='.repeat(80));
        console.log(`⚠️  Total unsafe patterns found: ${this.issues.length}`);
        console.log('='.repeat(80) + '\n');

        return this.issues;
    }

    getSummary() {
        return {
            totalIssues: this.issues.length,
            highSeverity: this.issues.filter(i => i.severity === 'HIGH').length,
            issues: this.issues
        };
    }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
    const targetDir = process.argv[2] || './src';

    console.log(`🔍 Scanning ${targetDir} for unsafe useMemo hooks...\n`);

    const scanner = new UseMemoScanner();
    scanner.scanDirectory(targetDir);

    const summary = scanner.printResults();

    if (summary.length > 0) {
        console.log('NEXT STEPS:');
        console.log('1. Open each file listed above');
        console.log('2. Find the useMemo hook at the line number');
        console.log('3. Apply the safe pattern from useMemo-safety-fix.js');
        console.log('4. Re-run this scanner to verify\n');

        process.exit(1);
    } else {
        process.exit(0);
    }
}

module.exports = { UseMemoScanner };
