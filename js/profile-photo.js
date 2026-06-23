(function () {
  const image = document.querySelector("[data-profile-photo]");
  if (!image) return;

  const photos = [
    {
      src: "/images/home-rotation/profile-current.png",
      alt: "Grisha Taroyan",
      positionClass: "profile-position-top",
    },
    {
      src: "/images/home-rotation/profile-cats-chair.jpg",
      alt: "Grisha Taroyan with Sheavetz and Pafnutiy",
      positionClass: "profile-position-center",
    },
    {
      src: "/images/home-rotation/profile-lake-sunset.jpg",
      alt: "Grisha Taroyan by Lake Ontario at sunset",
      positionClass: "profile-position-right",
    },
    {
      src: "/images/home-rotation/profile-lake-hat.jpg",
      alt: "Grisha Taroyan by Lake Ontario",
      positionClass: "profile-position-left",
    },
    {
      src: "/images/home-rotation/profile-bubbles.jpg",
      alt: "Grisha Taroyan blowing bubbles",
      positionClass: "profile-position-center",
    },
    {
      src: "/images/home-rotation/profile-glitter.jpg",
      alt: "Grisha Taroyan on the subway",
      positionClass: "profile-position-center",
    },
    {
      src: "/images/home-rotation/profile-night-hat.jpg",
      alt: "Grisha Taroyan at night",
      positionClass: "profile-position-center",
    },
  ];

  const previousIndex = Number(window.sessionStorage.getItem("profile-photo-index"));
  let nextIndex = Math.floor(Math.random() * photos.length);
  if (photos.length > 1 && Number.isInteger(previousIndex)) {
    while (nextIndex === previousIndex) {
      nextIndex = Math.floor(Math.random() * photos.length);
    }
  }

  const selected = photos[nextIndex];
  window.sessionStorage.setItem("profile-photo-index", String(nextIndex));
  image.classList.remove(
    "profile-position-top",
    "profile-position-center",
    "profile-position-left",
    "profile-position-right"
  );
  image.classList.add(selected.positionClass);
  image.src = selected.src;
  image.alt = selected.alt;
})();
