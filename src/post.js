const fs = require("fs")
const { DefaultArtifactClient } = require("@actions/artifact")

const FILE_NAME = "matrix-lock-17c3b450-53fd-4b8d-8df8-6b5af88022dc.lock"
const ARTIFACT_NAME = `matrix-lock-${process.env.MATRIX_LOCK_ID || 'default'}`

async function run() {
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
