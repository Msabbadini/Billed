import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    this.formData = null
    this.filePath = ""
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    if(!file){ 
      this.document.querySelector(`input[data-testid="file"]`).value=''
      alert('Aucun fichier sélectionné')
      return;  
    }
    const filePath = e.target.value.split(/\\/g)
  
    const allowedExtension = ['image/jpg','image/jpeg','image/png']
    if(allowedExtension.includes(file.type)){
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)
      this.formData = formData
      this.filePath = filePath
    }
    else {
      alert('Extension de fichier non valide. Veuillez télécharger un fichier avec une extension jpg, jpeg ou png.');
      this.document.querySelector(`input[data-testid="file"]`).value=''
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    if(!this.formData){
      alert('Aucun fichier sélectionné')
      return; 
    }
    this.store
    .bills()
    .create({
      data: this.formData,
      headers: {
        noContentType: true
      }
    })
    .then(({fileUrl, key}) => {
      console.log(fileUrl)
      this.billId = key
      this.fileUrl = fileUrl
      this.fileName = this.filePath[this.filePath.length-1]
      this.formData=null
    })
    .finally(()=>{
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    })
    .catch(error => console.error(error))
    
    this.formData= null
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}