const core = require("@actions/core")
const { DefaultArtifactClient } = require("@actions/artifact")

const ARTIFACT_NAME = "matrix-lock"

async function run() {
	try {
		const artifactClient = new DefaultArtifactClient()
		await artifactClient.deleteArtifact(ARTIFACT_NAME)
	} catch (error) {
		core.warning(error)
	}
}

run()
