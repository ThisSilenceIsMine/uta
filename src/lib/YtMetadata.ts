import axios from 'axios';

export const getTitle = async (url: string): Promise<string> => {
  const urlMetadata =
    `https://www.youtube.com/oembed?url=` + url + `&format=json`;

  const { title } = (await axios.get(urlMetadata)).data;

  return title;
};
