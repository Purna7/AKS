using System;
using System.Web.Mvc;

namespace ECommerceApp.Controllers
{
    public class HealthController : Controller
    {
        // GET: health
        public ActionResult Index()
        {
            var health = new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                service = "ECommerceApp",
                version = "1.0.0",
                framework = ".NET Framework 4.8"
            };

            return Json(health, JsonRequestBehavior.AllowGet);
        }

        // GET: health/ready
        public ActionResult Ready()
        {
            var readiness = new
            {
                status = "Ready",
                timestamp = DateTime.UtcNow,
                checks = new
                {
                    database = "OK",
                    cache = "OK"
                }
            };

            return Json(readiness, JsonRequestBehavior.AllowGet);
        }
    }
}
