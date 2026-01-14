using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OfferLatterGeneration.Models
{
    public class OfferLetterModel
    {
        public int Id { get; set; }
        public string CandidateName { get; set; }
        public string Designation { get; set; }
        public string Department { get; set; }
        public string Location { get; set; }
        public decimal Salary { get; set; }
        public string JoiningDate { get; set; }
        public string LetterBody { get; set; }
    }
}