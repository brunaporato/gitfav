import { GithubUser } from "./githubUser.js"


export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error ('User already favorited')
      }

      const user = await GithubUser.search(username)
      if(user.login === undefined) {
        throw new Error ('User not found :/')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }

  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => {
      if(entry.login !== user.login) {
        return true
      }
    })

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('.filled-tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const favButton = this.root.querySelector('.search button')
    const search = this.root.querySelector('.search input')

    favButton.onclick = () => {
      const { value } = search
      this.add(value)
      search.value = ""
    }

    search.addEventListener('keydown', function(e) {
      if(e.key === 'Enter') {
        favButton.click()
        search.value = ""
      }
    })

  }

  update() {
    this.removeAlltr()

    this.entries.forEach(user => {
      const tr = this.createTr()
      
      tr.querySelector('.user img').src = `https://github.com/${user.login}.png`
      tr.querySelector('.user img').alt = `${user.name} picture`
      tr.querySelector('.user a').href = `https://github.com/${user.login}`
      tr.querySelector('.user p').textContent = user.name
      tr.querySelector('.user span').textContent = `/${user.login}`
      tr.querySelector('.repositories').textContent = user.public_repos
      tr.querySelector('.followers').textContent = user.followers

      tr.querySelector('.remove').onclick = () => {
        const areYouSure = confirm('Do you want to delete this user?')
        if(areYouSure) {
          this.delete(user)
        }
      }

      this.tbody.append(tr)
    })
  }

  createTr() {
    const tr = document.createElement('tr')

    const innerTr = `
        <td class="user">
          <img src="https://github.com/brunaporato.png" alt="Imagem de brunaporato">
          <a href="https://github.com/brunaporato" target="_blank">
            <p>Bruna Porato</p>
            <span>/brunaporato</span>
          </a>
        </td>
        <td class="repositories">
          120
        </td>
        <td class="followers">
          152
        </td>
        <td>
          <button class="remove">Remove</button>
        </td>
    `

    tr.innerHTML = innerTr

    return tr
  }

  removeAlltr() {
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove()
    })
 }
}