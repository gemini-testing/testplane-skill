console.log("Hello, world!");
try {
    console.log('testplane is installed', require.resolve("@testplane/cli"));
} catch (error) {
    console.error('testplane is not installed', error);
}

console.log('end');
