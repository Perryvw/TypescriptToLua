import { runMemoryBenchmark, compareMemoryBenchmarks } from "./memory_benchmark";
import { isMemoryBenchmarkResult, BenchmarkResult, MemoryBenchmarkResult, ComparisonInfo } from "./benchmark_types";
import { json, loadBenchmarksFromDirectory, readFile } from "./util";

// CLI arguments
// arg[0]: output path for benchmark data
// arg[1]: path to baseline benchmark data (required to generate comparison)
// arg[2]: path to result markdown file (optional)
declare const arg: [string | undefined, string | undefined, string | undefined];

function benchmark(): void {
    // Memory tests
    let memoryBenchmarkNewResults: MemoryBenchmarkResult[] = [];

    const memoryBenchmarks = loadBenchmarksFromDirectory("memory_benchmarks");

    if (memoryBenchmarks.success) {
        memoryBenchmarkNewResults = memoryBenchmarks.value.map(runMemoryBenchmark);
    } else {
        print(memoryBenchmarks.error);
        os.exit(1);
    }

    // run future benchmarks types here

    const newBenchmarkResults = [...memoryBenchmarkNewResults];

    // Try to read the baseline benchmark result
    let oldBenchmarkResults: BenchmarkResult[] = [];
    if (arg[1]) {
        const oldBenchmarkData = readFile(arg[1]);
        if (oldBenchmarkData.success) {
            oldBenchmarkResults = json.decode(oldBenchmarkData.value) as BenchmarkResult[];
        }
    }

    // Compare results
    const comparisonInfo = compareBenchmarks(oldBenchmarkResults, newBenchmarkResults);

    // Output comparison info
    outputBenchmarkData(comparisonInfo, newBenchmarkResults);
}
benchmark();

function compareBenchmarks(oldResults: BenchmarkResult[], newResults: BenchmarkResult[]): ComparisonInfo {
    const oldResultsMemory = oldResults.filter(isMemoryBenchmarkResult);
    const newResultsMemory = newResults.filter(isMemoryBenchmarkResult);

    const memoryComparisonInfo = compareMemoryBenchmarks(oldResultsMemory, newResultsMemory);

    return { summary: memoryComparisonInfo.summary, text: memoryComparisonInfo.text };
}

function outputBenchmarkData(comparisonInfo: { summary: string; text: string }, newResults: BenchmarkResult[]): void {
    if (!arg[2]) {
        // Output to stdout as json by default, this is used by the CI to retrieve the info
        print(json.encode(comparisonInfo));
    } else {
        // Output to file as markdown if arg[2] is set, this is useful for local development
        const markdownDataFile = io.open(arg[2], "w+")[0]!;
        markdownDataFile.write(comparisonInfo.summary + comparisonInfo.text);
    }
    // Output benchmark results to json
    if (arg[0]) {
        const jsonDataFile = io.open(arg[0], "w+")[0]!;
        jsonDataFile.write(json.encode(newResults));
    }
}
