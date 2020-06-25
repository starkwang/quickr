export default async function (req, res) {
  res.send(Object.keys(req.files))
}
