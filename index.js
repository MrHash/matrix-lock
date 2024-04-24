const core = require("@actions/core")
const { DefaultArtifactClient } = require("@actions/artifact")
const fs = require("fs")
const path = require("path")

const FILE_NAME = "matrix-lock-17c3b450-53fd-4b8d-8df8-6b5af88022dc.lock"
const ARTIFACT_NAME = "matrix-lock"

async function run() {
	try {
		const artifactClient = new DefaultArtifactClient()

		const step = core.getInput("step", { required: true })
		switch (step) {
			case "init":
				{
					const order = core.getInput("order", { required: true })
					const workspace = process.env.GITHUB_WORKSPACE
					const fullPath = path.join(workspace, FILE_NAME)

					fs.writeFileSync(FILE_NAME, order)

					const upload = await artifactClient.uploadArtifact(ARTIFACT_NAME, [fullPath], process.env.GITHUB_WORKSPACE)
					core.info(`Uploaded artifact ${upload.id}`)

					core.info("Matrix lock initialized")
				}
				break
			case "wait":
				{
					core.info("Waiting for matrix lock...")
					const id = core.getInput("id", { required: true })
					const retryCount = core.getInput("retry-count")
					const retryDelay = core.getInput("retry-delay")

					let shouldContinue = false

					for (let index = 0; index < retryCount; index++) {
						core.info(`Try: ${index + 1}/${retryCount}`)

						try {
							const artifact = await artifactClient.getArtifact(ARTIFACT_NAME)
							core.info(`Found artifact ${artifact.id}`)

							const download = await artifactClient.downloadArtifact(artifact.id, { path: workspace })
							core.info(`Downloaded artifact to ${download.downloadPath}`)

							const lockFile = fs.readFileSync(FILE_NAME, { encoding: "utf8" })

							if (id === lockFile.split(",")[0]) {
								shouldContinue = true
								break
							}
						} catch (err) {
							core.error(err)
							core.warning("Matrix lock not available")
						}

						await sleep(1000 * retryDelay)
					}

					if (!shouldContinue) {
						core.setFailed("Wait retry limit reached")
						break
					}

					const deletion = await artifactClient.deleteArtifact(ARTIFACT_NAME)
					core.info(`Downloaded artifact ${deletion.id}`)

					core.info("Matrix lock released")
				}
				break
			case "continue":
				{
					const artifact = await artifactClient.getArtifact(ARTIFACT_NAME)
					core.info(`Found artifact ${artifact.id}`)

					await artifactClient.downloadArtifact(artifact.id, { path: workspace })
					core.info(`Downloaded artifact to ${download.downloadPath}`)

					const lockFile = fs.readFileSync(FILE_NAME, { encoding: "utf8" })
					const newOrder = lockFile.split(",").slice(1).join(",")

					fs.writeFileSync(FILE_NAME, newOrder)

					await artifactClient.uploadArtifact(ARTIFACT_NAME, [fullPath], workspace)

					core.info("Continuing matrix...")
				}
				break
			default:
				{
					core.setFailed("Unkown step: " + step)
				}
				break
		}
	} catch (error) {
		core.setFailed(error.message)
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

run()
