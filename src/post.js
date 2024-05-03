const fs = require("fs")
const { DefaultArtifactClient } = require("@actions/artifact")

const FILE_NAME = `matrix-lock-${process.env.GITHUB_JOB}.lock`
const ARTIFACT_NAME = `matrix-lock-${process.env.GITHUB_JOB}`

async function run() {
	console.log(FILE_NAME)
	console.log(ARTIFACT_NAME)
	try {
		const artifactClient = new DefaultArtifactClient()
		const {artifact} = await artifactClient.getArtifact(ARTIFACT_NAME)
		await artifactClient.downloadArtifact(artifact.id)
		const lockFile = fs.readFileSync(FILE_NAME, { encoding: "utf8" })
		if (lockFile.length == 0) {
			await artifactClient.deleteArtifact(ARTIFACT_NAME)
		}
	} catch (err) {
	}
}

run()
